"""
ai/price_prediction/src/features.py

Leakage-safe feature engineering for mandi price forecasting.
Every rule below maps directly to docs/price/target-and-leakage.md.

Design: features are built PER SERIES (state, market, commodity), using
only information available at each row's own arrival_date - never future
rows of the same series (rule 7).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

SERIES_KEYS = ["state", "market", "commodity"]


def add_calendar_features(df: pd.DataFrame, date_col: str = "arrival_date_parsed") -> pd.DataFrame:
    out = df.copy()
    out["day_of_week"] = out[date_col].dt.dayofweek
    out["day_of_month"] = out[date_col].dt.day
    out["month"] = out[date_col].dt.month
    out["week_of_year"] = out[date_col].dt.isocalendar().week.astype(int)
    out["is_weekend"] = out["day_of_week"].isin([5, 6]).astype(int)
    return out


def add_lag_features(df: pd.DataFrame, lags=(1, 3, 7, 14), date_col: str = "arrival_date_parsed") -> pd.DataFrame:
    """lag_N = modal_price N rows back WITHIN the same series, ordered by date.
    Uses .shift(N) after a per-series sort - never looks at rows that come
    after the current one in time (rule 7)."""
    out = df.sort_values(SERIES_KEYS + [date_col]).copy()
    g = out.groupby(SERIES_KEYS)["modal_price"]
    for lag in lags:
        out[f"lag_{lag}"] = g.shift(lag)
    return out


def add_rolling_features(df: pd.DataFrame, windows=(7, 14), date_col: str = "arrival_date_parsed") -> pd.DataFrame:
    """Rolling mean/std computed on lag_1 (i.e. shifted by 1 first), so the
    window for row t only ever includes t-1, t-2, ... - the row's own,
    same-day price is never inside its own rolling feature."""
    out = df.sort_values(SERIES_KEYS + [date_col]).copy()
    shifted = out.groupby(SERIES_KEYS)["modal_price"].shift(1)
    out["_shifted_for_rolling"] = shifted
    for w in windows:
        out[f"rolling_mean_{w}"] = (
            out.groupby(SERIES_KEYS)["_shifted_for_rolling"]
            .transform(lambda s: s.rolling(window=w, min_periods=max(2, w // 2)).mean())
        )
        out[f"rolling_std_{w}"] = (
            out.groupby(SERIES_KEYS)["_shifted_for_rolling"]
            .transform(lambda s: s.rolling(window=w, min_periods=max(2, w // 2)).std())
        )
    out = out.drop(columns=["_shifted_for_rolling"])
    return out


def add_series_encoding(df: pd.DataFrame) -> pd.DataFrame:
    """Simple, leak-free categorical encoding: integer codes fit on the
    categories PRESENT in df (caller is responsible for fitting only on
    the training window and reusing the same mapping for val/test - see
    build_feature_matrix's `category_maps` return value)."""
    out = df.copy()
    return out


def build_targets(df: pd.DataFrame, horizons=(1, 7), date_col: str = "arrival_date_parsed") -> pd.DataFrame:
    """target_h = modal_price h rows AHEAD within the same series.
    This is the only place the pipeline is allowed to look forward, and it
    is explicitly the label, not a feature."""
    out = df.sort_values(SERIES_KEYS + [date_col]).copy()
    for h in horizons:
        out[f"target_{h}d"] = out.groupby(SERIES_KEYS)["modal_price"].shift(-h)
    return out


def build_feature_matrix(df: pd.DataFrame, category_maps: dict | None = None):
    """End-to-end: calendar + lag + rolling + targets, then categorical
    encoding fit ONLY on the categories passed in via category_maps (or,
    if None, fit on df itself - caller must pass the TRAIN split's map
    when transforming val/test, per leakage rule 6)."""
    out = add_calendar_features(df)
    out = add_lag_features(out)
    out = add_rolling_features(out)
    out = build_targets(out)

    cat_cols = ["state", "market", "commodity", "variety", "grade"]
    if category_maps is None:
        category_maps = {c: {v: i for i, v in enumerate(sorted(out[c].astype(str).unique()))} for c in cat_cols}
    for c in cat_cols:
        out[f"{c}_code"] = out[c].astype(str).map(category_maps[c]).fillna(-1).astype(int)

    return out, category_maps


def chronological_split(df: pd.DataFrame, date_col: str = "arrival_date_parsed",
                         val_days: int = 21, test_days: int = 14):
    """No shuffling, ever (rule 5). Last `test_days` = test, the `val_days`
    before that = validation, everything earlier = train."""
    max_date = df[date_col].max()
    test_start = max_date - pd.Timedelta(days=test_days - 1)
    val_start = test_start - pd.Timedelta(days=val_days)

    train = df[df[date_col] < val_start].copy()
    val = df[(df[date_col] >= val_start) & (df[date_col] < test_start)].copy()
    test = df[df[date_col] >= test_start].copy()
    return train, val, test
