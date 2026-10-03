"""tests/ai/common/test_validation.py"""
import pandas as pd
from ai.common.validation import validate_mandi_schema

GOOD_ROW = {
    "state": "Andhra Pradesh", "district": "Krishna", "market": "Vijayawada Mandi",
    "commodity": "Onion", "variety": "Bellary", "grade": "FAQ",
    "arrival_date": "11/08/2026", "min_price": 3000, "max_price": 3500, "modal_price": 3250,
}


def test_valid_schema_passes():
    df = pd.DataFrame([GOOD_ROW])
    result = validate_mandi_schema(df)
    assert result.ok, result.report()


def test_missing_column_flagged():
    df = pd.DataFrame([{"state": "Andhra Pradesh"}])
    result = validate_mandi_schema(df)
    assert not result.ok
    assert any("Missing columns" in i for i in result.issues)


def test_zero_price_flagged_not_silently_accepted():
    row = dict(GOOD_ROW)
    row["modal_price"] = 0
    df = pd.DataFrame([row])
    result = validate_mandi_schema(df)
    assert not result.ok


def test_price_order_violation_flagged():
    row = dict(GOOD_ROW)
    row["min_price"], row["max_price"] = 4000, 3000  # min > max, invalid
    df = pd.DataFrame([row])
    result = validate_mandi_schema(df)
    assert not result.ok


def test_duplicate_rows_flagged():
    df = pd.DataFrame([GOOD_ROW, GOOD_ROW])
    result = validate_mandi_schema(df)
    assert not result.ok
    assert any("duplicate" in i for i in result.issues)
