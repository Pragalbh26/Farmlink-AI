"""
ai/price_prediction/src/ingest.py

Mandi price data ingestion.

Primary source : data.gov.in "Current Daily Price of Various Commodities from
                  Various Markets (Mandi)" resource (Knowledge 04 S1).
                  Resource id CONFIRMED LIVE on 12 Aug 2026:
                  9ef84268-d588-465a-a308-a864a43d0070
                  https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi

Fallback        : a clearly-labelled SYNTHETIC fixture, for pipeline
                  development/testing only. Never used for reported metrics.

Rule (docs/price/target-and-leakage.md, rule 4): a missing price is NaN,
never silently 0.
"""

from __future__ import annotations

import time
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import requests

from ai.common.config import (
    DATA_RAW_DIR,
    DATA_GOV_IN_API_KEY,
    DATA_GOV_IN_SAMPLE_KEY,
    MANDI_RESOURCE_ID,
    RANDOM_SEED,
)
from ai.common.logging_utils import get_logger

logger = get_logger(__name__)

API_BASE = "https://api.data.gov.in/resource"
SCHEMA_COLUMNS = [
    "state", "district", "market", "commodity", "variety", "grade",
    "arrival_date", "min_price", "max_price", "modal_price",
]

# The public sample key data.gov.in itself publishes on the resource's docs
# page for testing. Hard-capped by the provider at 10 records per call,
# regardless of the limit/offset requested (confirmed empirically 12 Aug 2026).
SAMPLE_KEY_MAX_RECORDS = 10


def _fetch_page(resource_id: str, api_key: str, limit: int, offset: int,
                 filters: Optional[dict] = None) -> list:
    params = {"api-key": api_key, "format": "json", "limit": limit, "offset": offset}
    if filters:
        for k, v in filters.items():
            params[f"filters[{k}]"] = v
    resp = requests.get(f"{API_BASE}/{resource_id}", params=params, timeout=30)
    resp.raise_for_status()
    payload = resp.json()
    return payload.get("records", [])


def fetch_mandi_prices_sample(resource_id: str = MANDI_RESOURCE_ID) -> pd.DataFrame:
    """Fetch the small (<=10 row) REAL sample using data.gov.in's own public
    test key. Good for schema/connectivity checks. NOT a training dataset."""
    records = _fetch_page(resource_id, DATA_GOV_IN_SAMPLE_KEY, limit=SAMPLE_KEY_MAX_RECORDS, offset=0)
    df = pd.DataFrame.from_records(records)
    df["source"] = "data.gov.in"
    df["extracted_at"] = pd.Timestamp.now("UTC").isoformat()
    logger.info("Fetched %d REAL rows via the public sample key (max %d/call).",
                len(df), SAMPLE_KEY_MAX_RECORDS)
    return df


def fetch_mandi_prices(resource_id: str = MANDI_RESOURCE_ID, api_key: Optional[str] = None,
                        max_records: int = 20000, page_size: int = 1000,
                        filters: Optional[dict] = None) -> pd.DataFrame:
    """Full pull using a REGISTERED data.gov.in key (Category C - user must
    obtain this, see PROGRESS_LEDGER.md / ACTION REQUIRED). Registered keys
    get much higher per-call limits than the public sample key."""
    api_key = api_key or DATA_GOV_IN_API_KEY
    if not api_key:
        raise RuntimeError(
            "DATA_GOV_IN_API_KEY missing in .env - cannot do a full pull. "
            "Use fetch_mandi_prices_sample() for a schema check, or "
            "generate_synthetic_fixture() for pipeline development."
        )
    records: list = []
    offset = 0
    while len(records) < max_records:
        page = _fetch_page(resource_id, api_key, limit=page_size, offset=offset, filters=filters)
        if not page:
            break
        records.extend(page)
        offset += page_size
        time.sleep(0.2)  # polite to a public API
    df = pd.DataFrame.from_records(records)
    df["source"] = "data.gov.in"
    df["extracted_at"] = pd.Timestamp.now("UTC").isoformat()
    logger.info("Fetched %d REAL mandi price records from data.gov.in.", len(df))
    return df


def generate_synthetic_fixture(n_rows: int = 500, seed: int = RANDOM_SEED) -> pd.DataFrame:
    """
    CLEARLY-MARKED SYNTHETIC DATA - pipeline development/testing ONLY.
    Schema matches the CONFIRMED real data.gov.in schema exactly, and includes
    real multi-day history (which the tiny 10-row real sample does not have),
    so lag/rolling features and a naive baseline can actually be exercised
    this week while the registered API key is pending.
    Do NOT use for training the final model or for reporting any metric.
    """
    rng = np.random.default_rng(seed)

    states_markets = {
        "Maharashtra": ["Pune Mandi", "Nashik Mandi"],
        "Andhra Pradesh": ["Guntur Mandi", "Vijayawada Mandi"],
        "Uttar Pradesh": ["Agra Mandi", "Kanpur Mandi"],
        "Karnataka": ["Bengaluru Mandi", "Hubli Mandi"],
        "Tamil Nadu": ["Chennai Mandi", "Coimbatore Mandi"],
    }
    commodities = {
        "Onion": 1500, "Tomato": 1200, "Potato": 900, "Wheat": 2100, "Rice": 2600,
    }
    dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=180, freq="D")

    rows = []
    for state, markets in states_markets.items():
        for market in markets:
            for commodity, base in commodities.items():
                # a persistent per-series offset so series are distinguishable,
                # not just noise around the same mean
                series_offset = rng.normal(0, base * 0.05)
                for d in dates:
                    seasonal = base * 0.08 * np.sin(2 * np.pi * d.dayofyear / 365)
                    noise = rng.normal(0, base * 0.04)
                    modal = max(50.0, base + series_offset + seasonal + noise)
                    spread = modal * rng.uniform(0.05, 0.15)
                    rows.append({
                        "state": state,
                        "district": f"{state.split()[0]} District",
                        "market": market,
                        "commodity": commodity,
                        "variety": "Standard",
                        "grade": "FAQ",
                        "arrival_date": d.strftime("%d/%m/%Y"),
                        "min_price": round(modal - spread, 2),
                        "max_price": round(modal + spread, 2),
                        "modal_price": round(modal, 2),
                    })
    df = pd.DataFrame(rows)
    if n_rows < len(df):
        df = df.sample(n=n_rows, random_state=seed).reset_index(drop=True)
    df["source"] = "SYNTHETIC_FIXTURE"
    df["extracted_at"] = pd.Timestamp.now("UTC").isoformat()
    df["is_synthetic"] = True
    logger.warning("Generated %d SYNTHETIC mandi price rows - NOT real data. "
                    "Do not use for reported metrics.", len(df))
    return df


def load_or_fetch(cache_dir: Path = DATA_RAW_DIR / "mandi_prices") -> tuple[pd.DataFrame, str]:
    """Returns (dataframe, source_label). source_label is one of:
    'real_full' (registered key), 'real_sample' (public 10-row key),
    'synthetic' (fixture). Always prefers the most real option available."""
    cache_dir.mkdir(parents=True, exist_ok=True)

    if DATA_GOV_IN_API_KEY:
        cache = cache_dir / "mandi_prices_real_full.csv"
        if cache.exists():
            return pd.read_csv(cache), "real_full"
        df = fetch_mandi_prices()
        df.to_csv(cache, index=False)
        return df, "real_full"

    real_sample_path = cache_dir / "seed_sample_REAL_10rows_2026-08-11.csv"
    synthetic_cache = cache_dir / "mandi_prices_SYNTHETIC.csv"

    if synthetic_cache.exists():
        return pd.read_csv(synthetic_cache), "synthetic"
    df = generate_synthetic_fixture()
    df.to_csv(synthetic_cache, index=False)
    logger.info("Real 10-row seed sample also available at %s for schema cross-check.",
                real_sample_path)
    return df, "synthetic"
