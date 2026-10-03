"""ai/rag/src/vector_store.py — ADR-004: FAISS, local file-based index."""
from __future__ import annotations

import json
import pickle
from pathlib import Path

import faiss
import numpy as np


class FaissStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatIP(dim)  # inner product on normalized vectors = cosine similarity
        self.metadata: list[dict] = []

    def add(self, vectors: np.ndarray, metadata: list[dict]) -> None:
        self.index.add(vectors)
        self.metadata.extend(metadata)

    def search(self, query_vector: np.ndarray, k: int = 5) -> list[dict]:
        scores, idxs = self.index.search(query_vector.reshape(1, -1), k)
        results = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx == -1:
                continue
            results.append({**self.metadata[idx], "score": float(score)})
        return results

    def save(self, path: Path) -> None:
        path.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(path / "index.faiss"))
        with open(path / "metadata.json", "w") as f:
            json.dump(self.metadata, f)
        from ai.rag.src.embeddings import save_tfidf_state
        save_tfidf_state(path / "tfidf_state.pkl")

    @classmethod
    def load(cls, path: Path) -> "FaissStore":
        index = faiss.read_index(str(path / "index.faiss"))
        store = cls(dim=index.d)
        store.index = index
        with open(path / "metadata.json") as f:
            store.metadata = json.load(f)
        tfidf_path = path / "tfidf_state.pkl"
        if tfidf_path.exists():
            from ai.rag.src.embeddings import load_tfidf_state
            load_tfidf_state(tfidf_path)
        return store
