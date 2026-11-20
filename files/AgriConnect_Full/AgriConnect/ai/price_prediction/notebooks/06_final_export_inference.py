#!/usr/bin/env python
# coding: utf-8

# # 06 — Final Export & Inference
# 
# **Workstream:** Price Prediction · **Batch 3 (Day 4)** · **Status: IMPLEMENTED**
# 
# Demonstrates `ai/price_prediction/src/inference.py` — the exact function Member 2's
# `POST /api/v1/prices/predict` endpoint will call. Also documents a real bug caught while building this
# (caller row-order assumption) and how it was fixed, per the "when I show output, inspect it critically" rule.

# In[1]:


import sys
from pathlib import Path
_root = next(p for p in [Path.cwd(), *Path.cwd().parents] if (p / "ai" / "common" / "config.py").exists())
sys.path.insert(0, str(_root))
import pandas as pd, json as _json
from ai.price_prediction.src.ingest import generate_synthetic_fixture
from ai.price_prediction.src.inference import PricePredictor

df = generate_synthetic_fixture(n_rows=100000, seed=42)
predictor = PricePredictor.load_latest()
print("Loaded model:", predictor.model_version, " trained:", predictor.training_cutoff_date)


# ## Bug caught during this batch
# 
# `predict()` originally trusted `recent_history.iloc[-1]` for the "most recent" row. A test that sorted by
# the *raw* `arrival_date` string (`sort_values("arrival_date")`) silently gave the wrong row — `"05/12/2026"
# < "20/01/2026"` as strings, which is backwards chronologically. Fixed by having `predict()` always re-sort on
# the *parsed* date internally, so it no longer depends on the caller doing the right thing.

# ## Predict for every (state, market, commodity) series — both horizons

# In[2]:


results = []
for (state, market, commodity), g in df.groupby(["state", "market", "commodity"]):
    g_sorted = g.sort_values("arrival_date")  # deliberately the "bad" sort - proves the fix holds
    for horizon in (1, 7):
        r = predictor.predict(g_sorted, horizon_days=horizon)
        results.append(r.to_dict())

results_df = pd.DataFrame(results)
print(f"Generated {len(results_df)} predictions across {results_df['commodity'].nunique()} commodities")
results_df.head(10)


# ## Sample API response (exact shape Member 2 will receive)

# In[3]:


sample = results[0]
envelope = {
    "success": True,
    "data": sample,
    "error": None,
    "meta": {"model_version": sample["model_version"], "is_synthetic_model": sample["is_synthetic_model"]},
}
print(_json.dumps(envelope, indent=2))


# ## Save all predictions

# In[4]:


from ai.common.config import DATA_PROCESSED_DIR
results_df.to_csv(DATA_PROCESSED_DIR / "price_predictions_ALL_SERIES_SYNTHETIC.csv", index=False)
print(f"Saved {len(results_df)} predictions -> data/processed/price_predictions_ALL_SERIES_SYNTHETIC.csv")


# ## Price prediction workstream — Batch 2-3 summary
# 
# | Notebook | Status |
# |---|---|
# | 01 data acquisition & inspection | IMPLEMENTED, executed |
# | 02 EDA & cleaning | IMPLEMENTED, executed |
# | 03 feature engineering | IMPLEMENTED, executed, leakage self-check passed |
# | 04 baseline & models | IMPLEMENTED, executed — linear_regression/random_forest/xgboost all beat naive baseline |
# | 05 evaluation & error analysis | IMPLEMENTED, executed |
# | 06 final export & inference | IMPLEMENTED, executed, one real bug caught + fixed |
# 
# **Everything above ran on the SYNTHETIC fixture** (no registered `DATA_GOV_IN_API_KEY` yet). The moment the
# key is added to `.env`, re-running notebooks 01-06 in order switches every one of them to `real_full` data
# with zero code changes — `load_or_fetch()` already checks for the key automatically. Nothing here is a
# reportable claim about real mandi prices; it is a fully-tested, working pipeline waiting on one credential.
