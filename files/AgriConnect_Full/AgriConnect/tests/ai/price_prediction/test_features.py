"""tests/ai/price_prediction/test_features.py"""
import pandas as pd
import numpy as np
from ai.price_prediction.src.features import (
    add_calendar_features, add_lag_features, add_rolling_features,
    build_targets, chronological_split, build_feature_matrix,
)


def _toy_series(n_days=20, base=1000.0, state="X", market="Y", commodity="Z"):
    dates = pd.date_range("2026-01-01", periods=n_days, freq="D")
    return pd.DataFrame({
        "state": state, "market": market, "commodity": commodity,
        "variety": "Std", "grade": "FAQ",
        "arrival_date": dates.strftime("%d/%m/%Y"),
        "arrival_date_parsed": dates,
        "modal_price": base + np.arange(n_days, dtype=float),  # 1000, 1001, 1002, ...
        "min_price": base + np.arange(n_days) - 10,
        "max_price": base + np.arange(n_days) + 10,
    })


def test_calendar_features_present_and_correct():
    df = _toy_series(n_days=8)
    out = add_calendar_features(df)
    assert "day_of_week" in out.columns
    assert out["day_of_week"].iloc[0] == df["arrival_date_parsed"].iloc[0].dayofweek
    assert set(out["is_weekend"].unique()).issubset({0, 1})


def test_lag_1_equals_previous_row_same_series():
    df = _toy_series(n_days=10)
    out = add_lag_features(df, lags=(1,))
    # modal_price is 1000..1009 in order, so lag_1 at row i should equal modal_price at row i-1
    expected = df["modal_price"].shift(1)
    pd.testing.assert_series_equal(out["lag_1"].reset_index(drop=True), expected.reset_index(drop=True), check_names=False)


def test_lag_features_do_not_leak_across_different_series():
    series_a = _toy_series(n_days=5, base=1000.0, commodity="Onion")
    series_b = _toy_series(n_days=5, base=5000.0, commodity="Tomato")
    combined = pd.concat([series_a, series_b], ignore_index=True)
    out = add_lag_features(combined, lags=(1,))
    # first row of EACH series must have lag_1 = NaN - no leakage from the other series
    first_rows = out.sort_values(["commodity", "arrival_date_parsed"]).groupby("commodity").head(1)
    assert first_rows["lag_1"].isna().all()


def test_rolling_mean_only_uses_past_values():
    df = _toy_series(n_days=10)
    out = add_rolling_features(df, windows=(3,))
    # rolling_mean_3 at the LAST row must not include the last row's own modal_price
    out_sorted = out.sort_values("arrival_date_parsed").reset_index(drop=True)
    last_idx = len(out_sorted) - 1
    manual_mean = out_sorted["modal_price"].iloc[last_idx - 3:last_idx].mean()  # excludes iloc[last_idx]
    assert abs(out_sorted["rolling_mean_3"].iloc[last_idx] - manual_mean) < 1e-6


def test_build_targets_looks_forward_correctly():
    df = _toy_series(n_days=10)
    out = build_targets(df, horizons=(1,))
    out_sorted = out.sort_values("arrival_date_parsed").reset_index(drop=True)
    # target_1d at row i should equal modal_price at row i+1
    for i in range(len(out_sorted) - 1):
        assert out_sorted["target_1d"].iloc[i] == out_sorted["modal_price"].iloc[i + 1]
    assert pd.isna(out_sorted["target_1d"].iloc[-1])  # last row has no "next day"


def test_chronological_split_no_overlap_and_ordered():
    df = _toy_series(n_days=60)
    train, val, test = chronological_split(df, val_days=10, test_days=5)
    assert len(train) + len(val) + len(test) == len(df)
    assert train["arrival_date_parsed"].max() < val["arrival_date_parsed"].min()
    assert val["arrival_date_parsed"].max() < test["arrival_date_parsed"].min()


def test_build_feature_matrix_reuses_category_maps_for_val():
    train_df = _toy_series(n_days=10, commodity="Onion")
    val_df = _toy_series(n_days=5, commodity="Onion")
    _, train_maps = build_feature_matrix(train_df)
    val_feat, val_maps = build_feature_matrix(val_df, category_maps=train_maps)
    assert val_maps is train_maps  # same mapping object reused, not refit on val (leakage rule 6)
    assert val_feat["commodity_code"].iloc[0] == train_maps["commodity"]["Onion"]
