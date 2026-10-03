"""tests/ai/price_prediction/test_baseline.py"""
import pandas as pd
import numpy as np
from ai.price_prediction.src.baseline import naive_baseline_predict, evaluate_naive_baseline


def _toy_df():
    dates = pd.date_range("2026-01-01", periods=5, freq="D")
    return pd.DataFrame({
        "state": "X", "market": "Y", "commodity": "Z",
        "arrival_date_parsed": dates,
        "modal_price": [100.0, 110.0, 120.0, 130.0, 140.0],
    })


def test_naive_prediction_carries_todays_price_forward():
    df = _toy_df()
    out = naive_baseline_predict(df, horizon_days=1)
    out_sorted = out.sort_values("arrival_date_parsed").reset_index(drop=True)
    # y_pred_naive at row i should equal modal_price at row i (today's price)
    assert (out_sorted["y_pred_naive"] == out_sorted["modal_price"]).all()
    # y_true at row i should equal modal_price at row i+1 (1 day ahead)
    assert out_sorted["y_true"].iloc[0] == 110.0
    assert pd.isna(out_sorted["y_true"].iloc[-1])


def test_evaluate_naive_baseline_mae_matches_manual_calculation():
    df = _toy_df()
    result = evaluate_naive_baseline(df, horizon_days=1)
    # differences are all exactly 10 (100->110, 110->120, 120->130, 130->140), so MAE = 10, RMSE = 10
    assert abs(result["mae"] - 10.0) < 1e-6
    assert abs(result["rmse"] - 10.0) < 1e-6
    assert result["n_pairs"] == 4  # 5 rows -> 4 valid (day, day+1) pairs
