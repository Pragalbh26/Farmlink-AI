"""
ai/rag/src/chunking.py
Chunks per scheme document: one chunk for the summary, one for eligibility
notes, one for the confidence/caveat note - each chunk keeps its own
metadata (scheme_id, source_url, verified_at) so retrieval results are
always traceable to a source (docs/rag/source-policy.md).
"""
from __future__ import annotations


def chunk_scheme_document(doc: dict) -> list[dict]:
    base_meta = {
        "scheme_id": doc["scheme_id"],
        "scheme_name": doc["scheme_name"],
        "jurisdiction": doc["jurisdiction"],
        "source_url": doc["source_url"],
        "verified_at": doc["verified_at"],
    }
    chunks = []
    chunks.append({**base_meta, "section": "summary", "text": doc["summary"]})
    chunks.append({**base_meta, "section": "eligibility", "text": doc["eligibility_notes"]})
    chunks.append({**base_meta, "section": "confidence_caveat", "text": doc["confidence"]})
    return chunks


def chunk_all(docs: list[dict]) -> list[dict]:
    out = []
    for doc in docs:
        out.extend(chunk_scheme_document(doc))
    return out
