"""
ai/rag/src/embeddings.py
ADR-004: sentence-transformers, multilingual model (English + Hindi MVP).

NOTE ON MODEL DOWNLOAD: sentence-transformers fetches model weights from
huggingface.co, which is outside this sandbox's whitelisted network - same
category of restriction as ai/disease_detection/src/model.py (PyTorch
weights) and for the same reason: a sandbox network policy, not a design
change. On an unrestricted machine, get_embedder() works exactly as
ADR-004 specifies with no code changes.

get_embedder() falls back to a TF-IDF vectorizer (scikit-learn, no
network needed) ONLY to prove the surrounding retrieval pipeline
(chunk -> embed -> index -> search) is wired correctly. TF-IDF is NOT
multilingual and is NOT the ADR-004 decision - every caller gets told
which path was used via `used_semantic_embeddings`, so a TF-IDF-backed
retrieval run can never be silently mistaken for the real thing.
"""
from ai.common.logging_utils import get_logger

logger = get_logger(__name__)

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"

_model = None
_tfidf = None
USED_SEMANTIC_EMBEDDINGS = None  # set on first call, module-level so all callers see the same answer


def get_embedder():
    global _model, USED_SEMANTIC_EMBEDDINGS
    if USED_SEMANTIC_EMBEDDINGS is not None:
        return _model  # decision already made this session, real model or None - don't retry every call
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
        USED_SEMANTIC_EMBEDDINGS = True
        logger.info("Loaded real sentence-transformers model: %s", MODEL_NAME)
    except Exception as e:
        logger.warning(
            "Could not load %s (%s) - huggingface.co is outside this sandbox's "
            "whitelisted network. Falling back to TF-IDF for THIS SANDBOX RUN ONLY - "
            "not multilingual, not ADR-004. Label results accordingly.",
            MODEL_NAME, type(e).__name__,
        )
        USED_SEMANTIC_EMBEDDINGS = False
        _model = None
    return _model


def embed_texts(texts: list[str], fit: bool = False):
    """Returns (vectors, used_semantic_embeddings). Vectors are always
    row-normalized so cosine similarity == dot product either way.

    fit=True (corpus indexing time): fits the TF-IDF vectorizer on these
    texts. fit=False (query time): reuses the already-fitted vectorizer -
    required, because a query embedded with its own tiny vocabulary would
    have the wrong dimension vs. the saved index (a real bug caught while
    testing notebook 02 in Batch 6: a fresh process has no fitted
    vectorizer in memory, so the fix also requires save_tfidf/load_tfidf
    below, called by FaissStore.save/load)."""
    import numpy as np
    model = get_embedder()
    if model is not None:
        vecs = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return np.asarray(vecs, dtype="float32"), True

    global _tfidf
    from sklearn.feature_extraction.text import TfidfVectorizer
    if fit or _tfidf is None:
        # ngram_range + stopword removal: a real, if partial, mitigation for the
        # cross-scheme keyword confusion found in Batch 6 continuation (5-scheme
        # corpus dropped TF-IDF top-1 accuracy from 100% to 50% vs. the original
        # 3-scheme corpus - PM-KISAN is literally mentioned inside the AP scheme's
        # own document, which pure unigram TF-IDF can't disambiguate well). This
        # does NOT fix the underlying limitation - only real semantic embeddings
        # (ADR-004) would - it just makes the fallback somewhat less bad.
        _tfidf = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
        vecs = _tfidf.fit_transform(texts).toarray()
    else:
        vecs = _tfidf.transform(texts).toarray()
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    vecs = (vecs / norms).astype("float32")
    return vecs, False


def save_tfidf_state(path) -> None:
    """No-op if the real semantic model was used (nothing stateful to save)."""
    if USED_SEMANTIC_EMBEDDINGS or _tfidf is None:
        return
    import pickle
    with open(path, "wb") as f:
        pickle.dump(_tfidf, f)


def load_tfidf_state(path) -> None:
    global _tfidf, _model, USED_SEMANTIC_EMBEDDINGS
    import pickle
    with open(path, "rb") as f:
        _tfidf = pickle.load(f)
    _model = None
    USED_SEMANTIC_EMBEDDINGS = False
