# Evaluation Metrics & Split Strategy — All Three AI Systems

**Task:** M1-W1-02 (Day 2)

## Price Prediction
- **Primary:** MAE, RMSE (Knowledge 04 §5)
- **Secondary (where mathematically appropriate):** MAPE/sMAPE — mandi modal prices are bounded away from
  zero in practice, so MAPE is usable, but always reported *alongside* MAE/RMSE, never alone.
- **Split:** Chronological only. No `shuffle=True` anywhere in this codebase. Last-N-days = test, preceding
  window = validation, everything before = train. Preprocessing fit on train only.
- **Report:** aggregate AND per-commodity/per-market, plus worst-error dates and volatile periods.
- **Targets:** modal_price, horizons = 1-day AND 7-day.

## Crop Disease Detection
- **Primary:** Macro F1 (not accuracy alone — class counts will not be balanced).
- **Secondary:** per-class precision/recall, confusion matrix, inference time, model size (Knowledge 05 §4).
- **Split:** stratified by class, split BEFORE augmentation; augmentation applied to the training split only.

## RAG Agricultural Assistant
- **Primary:** retrieval relevance (is the correct chunk in top-k?), groundedness, citation correctness.
- **Secondary:** hallucination rate, abstention correctness.
- **Eval set categories (Knowledge 12 §6):** eligibility, benefits, application, disease, mandi price, weather
  actions, transport, general agriculture, unsupported questions, contradictory sources, prompt-injection.

## Eligibility engine
- **Primary:** deterministic rule coverage (does every starter-scheme criterion map to an explicit rule?).
- Not a metric in the ML sense — correctness is binary per rule, verified by hand-tracing a real applicant
  profile through the schema (Member1 plan, M1-W4-04 validation step).

## `ai/experiments.csv` schema
One row per run, for every model in every system, including runs that lost.

| Column | Meaning |
|---|---|
| experiment_id | Short unique ID, e.g. `PRICE-004`, `DISEASE-011`, `RAG-007` |
| system | `price` / `disease` / `rag` |
| model | e.g. `naive`, `linear_regression`, `random_forest`, `xgboost`, `mobilenetv2_ft` |
| features_config | Feature set or hyperparameters used |
| dataset_version | Which versioned/snapshotted dataset this ran against |
| split_strategy | e.g. `chronological_70_15_15` |
| metric_primary | Only ever a measured number — never a placeholder |
| metric_secondary | RMSE, per-class scores, retrieval relevance, etc. |
| result | `beat_baseline` / `did_not_beat_baseline` / `selected` / `rejected` |
| notes | Why this run happened, what it tells you |

No row is ever added before the run has actually happened.
