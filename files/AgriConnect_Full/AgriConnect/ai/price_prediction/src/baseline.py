"""
ai/price_prediction/src/baseline.py

Naive / seasonal-naive baseline for mandi modal price forecasting.
Definition (docs/rag/source-policy.md / M1-W1-04):
  - naive: predict tomorrow's modal_price = today's modal_price (per series)
  - seasonal_naive: predict = modal_price from the same weekday last cycle
Every later model (linear regression, random forest, XGBoost, ...) must beat
this on the SAME chronological validation window before it is allowed to be
called "the model" anywhere in the report (Member1 plan, M1-W3-01 DoD).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

SERIES_KEYS = ["state", "market", "commodity"]


def _mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = ~(np.isnan(y_true) | np.isnan(y_pred))
    return float(np.mean(np.abs(y_true[mask] - y_pred[mask]))) if mask.any() else float("nan")


def _rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = ~(np.isnan(y_true) | np.isnan(y_pred))
    return float(np.sqrt(np.mean((y_true[mask] - y_pred[mask]) ** 2))) if mask.any() else float("nan")


def naive_baseline_predict(df: pd.DataFrame, horizon_days: int = 1) -> pd.DataFrame:
    """df must be sorted by date within each series. Adds `y_true` (the
    actual modal_price `horizon_days` ahead) and `y_pred_naive` (today's
    modal_price, carried forward) for every row where both exist."""
    out = df.sort_values(SERIES_KEYS + ["arrival_date_parsed"]).copy()
    out["y_pred_naive"] = out.groupby(SERIES_KEYS)["modal_price"].shift(0)
    out["y_true"] = out.groupby(SERIES_KEYS)["modal_price"].shift(-horizon_days)
    return out


def evaluate_naive_baseline(df: pd.DataFrame, horizon_days: int = 1) -> dict:
    """Returns {"mae": ..., "rmse": ..., "n_pairs": ...} for the naive
    baseline over whatever chronological window `df` already represents.
    Caller is responsible for passing only the validation window (leakage
    rule 8, docs/price/target-and-leakage.md) - this function does not
    split data itself."""
    scored = naive_baseline_predict(df, horizon_days=horizon_days)
    y_true = scored["y_true"].to_numpy(dtype=float)
    y_pred = scored["y_pred_naive"].to_numpy(dtype=float)
    n_pairs = int((~(np.isnan(y_true) | np.isnan(y_pred))).sum())
    return {
        "mae": _mae(y_true, y_pred),
        "rmse": _rmse(y_true, y_pred),
        "n_pairs": n_pairs,
        "horizon_days": horizon_days,
    }
