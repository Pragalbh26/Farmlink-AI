"""ai/rag/src/loaders.py"""
import json
from pathlib import Path


def load_scheme_documents(schemes_dir: Path) -> list[dict]:
    """Loads every real (non-STUB) scheme JSON. STUBs are explicitly
    excluded so the RAG index never silently includes an unsourced scheme -
    Knowledge 06's "never invent eligibility criteria" rule."""
    docs = []
    for f in sorted(schemes_dir.glob("*.json")):
        if f.name.endswith("_STUB.json"):
            continue
        with open(f) as fh:
            docs.append(json.load(fh))
    return docs
