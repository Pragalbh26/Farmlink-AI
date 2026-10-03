"""tests/ai/test_service_integration.py — real integration tests, TestClient, no mocking of our own code."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from fastapi.testclient import TestClient
from service.main import app


def test_health_reports_all_models_loaded():
    with TestClient(app) as client:
        r = client.get("/health")
        assert r.status_code == 200
        body = r.json()
        assert body["price_model_loaded"] is True
        assert body["disease_model_loaded"] is True
        assert body["rag_index_loaded"] is True


def test_price_predict_returns_envelope_shape():
    with TestClient(app) as client:
        r = client.post("/api/v1/prices/predict",
                         json={"state": "Maharashtra", "market": "Pune Mandi", "commodity": "Onion", "horizon_days": 1})
        assert r.status_code == 200
        body = r.json()
        assert set(body.keys()) == {"success", "data", "error", "meta"}
        assert body["success"] is True
        assert body["data"]["is_synthetic_model"] is True  # honest label, not hidden


def test_price_predict_unknown_series_returns_explicit_error_not_a_guess():
    with TestClient(app) as client:
        r = client.post("/api/v1/prices/predict",
                         json={"state": "Nowhere", "market": "Nowhere Mandi", "commodity": "Unobtanium", "horizon_days": 1})
        body = r.json()
        assert body["success"] is False
        assert body["error"]["code"] == "SERIES_NOT_FOUND"


def test_eligibility_excludes_registered_professional():
    with TestClient(app) as client:
        r = client.post("/api/v1/schemes/eligibility",
                         json={"scheme_id": "pm-kisan", "owns_cultivable_land": True, "is_registered_professional": True})
        body = r.json()
        assert body["data"]["status"] == "Not eligible"


def test_eligibility_unknown_scheme_returns_error():
    with TestClient(app) as client:
        r = client.post("/api/v1/schemes/eligibility", json={"scheme_id": "not-a-real-scheme"})
        body = r.json()
        assert body["success"] is False
        assert body["error"]["code"] == "UNKNOWN_SCHEME"


def test_chat_never_returns_fabricated_answer_without_llm_key():
    with TestClient(app) as client:
        r = client.post("/api/v1/chat", json={"query": "How much does PM-KISAN pay?"})
        body = r.json()
        # retrieval succeeds (sources present) but generation is honestly blocked without a key
        assert len(body["data"]["sources"]) > 0
        assert body["data"]["abstained"] is True
        assert body["data"]["answer"] is None


def test_eligibility_covers_all_five_sourced_schemes():
    with TestClient(app) as client:
        for scheme_id in ["pm-kisan", "kcc", "pmfby", "agriculture-infrastructure-fund", "ap-annadata-sukhibhava"]:
            r = client.post("/api/v1/schemes/eligibility", json={"scheme_id": scheme_id, "owns_cultivable_land": True})
            body = r.json()
            assert body["success"] is True, f"{scheme_id} failed: {body}"
            assert body["data"]["status"] in ["Eligible", "Potentially eligible", "Not eligible", "Insufficient information"]


def test_ap_scheme_honestly_abstains_on_exact_benefit_amount():
    """The AP scheme's benefit amount is disputed across sources post-2024 rename
    (docs/rag/source-policy.md) - the engine must never assert a specific status
    for it beyond Insufficient information, regardless of profile completeness."""
    with TestClient(app) as client:
        r = client.post("/api/v1/schemes/eligibility", json={
            "scheme_id": "ap-annadata-sukhibhava", "owns_cultivable_land": True,
            "is_institutional_landholder": False, "is_government_employee_above_group_d": False,
            "is_registered_professional": False, "pays_income_tax": False,
            "holds_constitutional_or_elected_post": False,
        })
        body = r.json()
        assert body["data"]["status"] == "Insufficient information"


def test_pmfby_honestly_abstains_pending_state_crop_data():
    with TestClient(app) as client:
        r = client.post("/api/v1/schemes/eligibility", json={"scheme_id": "pmfby", "owns_cultivable_land": True})
        body = r.json()
        assert body["data"]["status"] == "Insufficient information"
