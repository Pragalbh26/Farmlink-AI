# Model Card — Mandi Price Prediction (1-day horizon)

**Status: SYNTHETIC-DATA VALIDATION RUN — not a deployable model.** Real training on `real_full` data is
Batch 2-3's next iteration once `DATA_GOV_IN_API_KEY` is available (see `PROGRESS_LEDGER.md`).

## Basics
- **Model:** Linear Regression (best of 3 candidates on this run — see comparison below) — `ADR-001`
- **Trained:** 13 Aug 2026 · **Random seed:** 42 · **Dataset:** SYNTHETIC fixture (`ai/price_prediction/src/ingest.py::generate_synthetic_fixture`), 9,000 rows, 5 states × 2 markets × 5 commodities × 180 days
- **Split:** chronological — train ends 2026-07-09, val 2026-07-10 to 2026-07-30, test 2026-07-31 to 2026-08-13 (`ai/price_prediction/src/features.py::chronological_split`)
- **Features:** calendar (day-of-week/month, is_weekend) + lag(1,3,7,14) + rolling mean/std(7,14) + categorical codes for state/market/commodity

## Validation-set results (1-day horizon, SYNTHETIC data — n=1050 usable rows)

| Model | MAE | RMSE | Beats naive baseline? |
|---|---:|---:|:---:|
| naive_baseline (lag_1 carried forward) | 74.10 | 98.55 | — |
| **linear_regression** | **54.41** | **72.54** | Yes |
| random_forest | 57.26 | 77.43 | Yes |
| xgboost | 56.71 | 76.14 | Yes |

## Limitations (read before citing this anywhere)
1. **All numbers above are synthetic-fixture results.** The fixture's price series is a smooth seasonal
   sine wave plus Gaussian noise — real mandi prices have sharper shocks, festival-demand spikes, and
   supply-chain discontinuities the fixture doesn't simulate. Linear Regression winning here is plausible
   *for this fixture's shape* and should not be assumed to hold on real data.
2. Commodity/market shortlist is not finalized (`docs/price/target-and-leakage.md`) — real coverage audit
   pending the registered API key.
3. `uncertainty` field in every prediction response is currently `null` — no quantile/interval model has
   been trained yet.
4. 7-day horizon was engineered as a target but not yet compared model-to-model (only 1-day shown here) —
   next iteration.

## Reproducibility
`ai/price_prediction/notebooks/01` through `06`, run in order, on a machine with a registered
`DATA_GOV_IN_API_KEY` in `.env`, regenerates this entire card's numbers against real data with zero code
changes (`load_or_fetch()` already prefers `real_full` automatically).
