"""ai/rag/src/retriever.py"""
from ai.rag.src.embeddings import embed_texts
from ai.rag.src.vector_store import FaissStore


def build_index(chunks: list[dict]) -> tuple[FaissStore, bool]:
    texts = [c["text"] for c in chunks]
    vectors, used_semantic = embed_texts(texts, fit=True)  # fit=True: this IS the corpus
    store = FaissStore(dim=vectors.shape[1])
    store.add(vectors, chunks)
    return store, used_semantic


def retrieve(store: FaissStore, query: str, k: int = 3) -> list[dict]:
    query_vec, _ = embed_texts([query], fit=False)  # fit=False: reuse the corpus vocabulary
    return store.search(query_vec[0], k=k)
