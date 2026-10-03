"""tests/ai/rag/test_loaders.py"""
import json
from ai.rag.src.loaders import load_scheme_documents


def test_stub_files_are_never_loaded(tmp_path):
    real_doc = {"scheme_id": "real-one", "scheme_name": "Real Scheme", "jurisdiction": "Central",
                "source_url": "https://example.gov.in", "verified_at": "2026-08-16",
                "summary": "s", "eligibility_notes": "e", "confidence": "c"}
    (tmp_path / "real-one.json").write_text(json.dumps(real_doc))
    (tmp_path / "unsourced-scheme_STUB.json").write_text(json.dumps({"scheme_id": "unsourced-scheme", "status": "NOT YET SOURCED"}))

    docs = load_scheme_documents(tmp_path)
    assert len(docs) == 1
    assert docs[0]["scheme_id"] == "real-one"


def test_loads_the_real_current_scheme_corpus():
    """Integration-style check against the actual data/ directory - catches
    a scheme file becoming malformed JSON or losing a required field."""
    from ai.common.config import PROJECT_ROOT
    docs = load_scheme_documents(PROJECT_ROOT / "data" / "raw" / "government_schemes")
    assert len(docs) == 5  # pm-kisan, kcc, pmfby, agriculture-infrastructure-fund, ap-annadata-sukhibhava
    ids = {d["scheme_id"] for d in docs}
    assert ids == {"pm-kisan", "kcc", "pmfby", "agriculture-infrastructure-fund", "ap-annadata-sukhibhava"}
    for d in docs:
        assert d["source_url"].startswith("https://")
        assert d["verified_at"]
