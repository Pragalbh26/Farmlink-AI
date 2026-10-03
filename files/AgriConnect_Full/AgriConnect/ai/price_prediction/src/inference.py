"""
ai/price_prediction/src/inference.py

Inference function matching the confirmed API contract
(docs/price/target-and-leakage.md -> POST /api/v1/prices/predict,
 response envelope from Knowledge 09 / docs/handoffs/batch1_team_notes.md).

This is what Member 2's FastAPI endpoint will call directly - the contract
here is the real handoff surface, not just an internal implementation detail.
"""
from __future__ import annotations

import json
import pickle
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

import pandas as pd

from ai.common.config import PROJECT_ROOT
from ai.price_prediction.src.features import build_feature_matrix

MODEL_DIR = PROJECT_ROOT / "ai" / "price_prediction" / "models"
FEATURE_COLS = [
    "day_of_week", "day_of_month", "month", "week_of_year", "is_weekend",
    "lag_1", "lag_3", "lag_7", "lag_14", "rolling_mean_7", "rolling_std_7",
    "rolling_mean_14", "rolling_std_14", "state_code", "market_code", "commodity_code",
]


@dataclass
class PricePrediction:
    commodity: str
    market: str
    state: str
    horizon_days: int
    forecast_date: str
    predicted_price: Optional[float]
    unit: str
    model_version: str
    training_cutoff_date: str
    uncertainty: Optional[str]  # None until a real quantile/interval model is trained
    is_synthetic_model: bool

    def to_dict(self) -> dict:
        return asdict(self)


class PricePredictor:
    """Loads a trained model + records exactly which one/when, so
    model_version and training_cutoff_date in every response are real,
    not placeholders (Testing_Evaluation_Responsible_AI.pdf requirement)."""

    def __init__(self, model_path: Path, is_synthetic_model: bool):
        self.model_path = Path(model_path)
        self.is_synthetic_model = is_synthetic_model
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)
        self.model_version = self.model_path.stem
        self.training_cutoff_date = pd.Timestamp.fromtimestamp(
            self.model_path.stat().st_mtime
        ).date().isoformat()

    @classmethod
    def load_latest(cls) -> "PricePredictor":
        candidates = sorted(MODEL_DIR.glob("*_1d_SYNTHETIC.pkl"))
        if not candidates:
            raise FileNotFoundError(
                f"No trained model found in {MODEL_DIR} - run notebook 04 first."
            )
        return cls(candidates[-1], is_synthetic_model=True)

    def predict(self, recent_history: pd.DataFrame, horizon_days: int = 1) -> PricePrediction:
        """recent_history: rows for ONE (state, market, commodity) series,
        sorted ascending by arrival_date_parsed, with at least 14 rows of
        real history so lag_14/rolling_14 aren't NaN. The most recent row's
        features are what gets predicted forward."""
        if recent_history.empty:
            raise ValueError("recent_history is empty - cannot predict.")

        recent_history = recent_history.copy()
        if "arrival_date_parsed" not in recent_history.columns:
            recent_history["arrival_date_parsed"] = pd.to_datetime(
                recent_history["arrival_date"], format="%d/%m/%Y"
            )
        # NOTE: do not trust the caller's row order. sort_values("arrival_date")
        # on the raw DD/MM/YYYY string sorts alphabetically, not chronologically
        # (e.g. "05/12/2026" < "20/01/2026" as strings) - this was a real bug
        # caught during Batch 3 testing. Always re-sort on the parsed date here.
        recent_history = recent_history.sort_values("arrival_date_parsed")

        feat_df, _ = build_feature_matrix(recent_history)
        latest = feat_df.iloc[[-1]]

        row = latest[FEATURE_COLS]
        predicted_price = None
        if not row.isna().any(axis=None):
            predicted_price = float(self.model.predict(row)[0])

        last_row = recent_history.iloc[-1]
        forecast_date = (
            last_row["arrival_date_parsed"] + pd.Timedelta(days=horizon_days)
        ).date().isoformat()

        return PricePrediction(
            commodity=str(last_row["commodity"]),
            market=str(last_row["market"]),
            state=str(last_row["state"]),
            horizon_days=horizon_days,
            forecast_date=forecast_date,
            predicted_price=predicted_price,
            unit="INR/quintal",
            model_version=self.model_version,
            training_cutoff_date=self.training_cutoff_date,
            uncertainty=None,
            is_synthetic_model=self.is_synthetic_model,
        )
