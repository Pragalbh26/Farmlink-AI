import pytest
from ai.conversational_ai.src.eligibility_engine import check_scheme_eligibility

def test_scheme_eligibility_matching(tmp_path):
    # Setup temporary schemes file
    db_file = tmp_path / "test_schemes.json"
    db_file.write_text('''[
        {
            "scheme_id": "TEST_01",
            "scheme_name": "Test Scheme",
            "financial_benefit": "₹1000",
            "official_url": "https://example.com",
            "eligibility_criteria": {
                "min_land_holding_ha": 0.5,
                "max_land_holding_ha": 5.0,
                "allowed_occupations": ["Farmer"]
            }
        }
    ]''')
    
    valid_profile = {"land_holding_ha": 2.0, "occupation": "Farmer"}
    results = check_scheme_eligibility(valid_profile, str(db_file))
    assert len(results) == 1
    assert results[0]["scheme_id"] == "TEST_01"
