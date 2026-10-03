# Price Prediction — Target Definition & Leakage-Safe Pipeline

**Task:** M1-W1-03 (Day 3)

## Target
- **target = modal_price** (Knowledge 04)
- **Horizons: 1-day AND 7-day** — both, not just one.
- **Series definition:** one `commodity × market` pair = one series.
- **Candidate commodities:** Knowledge 04 says "start with 3-5 well-covered commodities... validate list in
  Week 1" — deliberately **not** hard-coded here. The live schema-validation pull (12 Aug 2026, 10 rows via the
  public data.gov.in sample key) already shows Onion and Bengal Gram alongside several vegetables; the
  officially-suggested MVP staples (Tomato, Potato, Wheat, Rice) still need a real coverage check once the
  registered API key is available (see Blocked, Progress Ledger). The shortlist gets finalized in Batch 2
  against actual per-series row counts, not assumed now.

## Leakage-safe pipeline checklist (Knowledge 04 §3, expanded to 8 explicit rules)
1. Keep raw / interim / processed data physically separate — code never overwrites `data/raw/`.
2. Normalize dates, units, numeric values, category names only in interim/processed, never in raw.
3. Audit duplicates and missing dates per `market × commodity` pair before any modeling.
4. **Never convert a missing price to zero** — missing stays `NaN`, imputed or dropped explicitly, never
   silently zeroed (a zero price is a valid-looking but catastrophic leakage/label bug).
5. Chronological train/validation/test splits only — `shuffle=True` is banned in this codebase for anything
   touching price data.
6. Fit all preprocessing (scalers, encoders, imputers) on the training window only, then transform val/test.
7. Lag/rolling features are built only from information available at the actual prediction time — a
   "7-day-ahead" row must not see day+1..+6 of its own target series.
8. The final test window stays untouched until model selection is complete (Week 4, per Member1 plan).

## API contract this feeds (Knowledge 04 §6 / Knowledge 02 §4-5 — confirmed, not designed here)
- `POST /api/v1/prices/predict` — in: commodity, market, horizon · out: forecast, observed price, date, unit,
  model_version, training_cutoff_date
- `GET /api/v1/prices` — in: commodity, location, range · out: historical/current observations + source
  timestamp
