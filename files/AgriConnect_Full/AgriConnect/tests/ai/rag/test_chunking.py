"""tests/ai/rag/test_chunking.py"""
from ai.rag.src.chunking import chunk_scheme_document, chunk_all

DOC = {
    "scheme_id": "test-scheme", "scheme_name": "Test Scheme", "jurisdiction": "Central",
    "source_url": "https://example.gov.in", "verified_at": "2026-08-16",
    "summary": "This is the summary text.",
    "eligibility_notes": "This is the eligibility text.",
    "confidence": "This is the confidence caveat.",
}


def test_chunk_scheme_document_produces_exactly_three_chunks():
    chunks = chunk_scheme_document(DOC)
    assert len(chunks) == 3
    sections = {c["section"] for c in chunks}
    assert sections == {"summary", "eligibility", "confidence_caveat"}


def test_every_chunk_carries_traceable_metadata():
    chunks = chunk_scheme_document(DOC)
    for c in chunks:
        assert c["scheme_id"] == "test-scheme"
        assert c["source_url"] == "https://example.gov.in"
        assert c["verified_at"] == "2026-08-16"
        assert c["text"]  # never an empty chunk


def test_chunk_all_multiplies_across_documents():
    doc2 = dict(DOC, scheme_id="test-scheme-2")
    chunks = chunk_all([DOC, doc2])
    assert len(chunks) == 6  # 3 chunks x 2 docs
    assert len({c["scheme_id"] for c in chunks}) == 2
