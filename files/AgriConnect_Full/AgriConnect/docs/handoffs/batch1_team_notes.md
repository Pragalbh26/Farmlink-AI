# Batch 1 — Notes for Members 2, 3, 4

Not full handoffs yet (those land when the relevant AI endpoint/model actually exists — Weeks 4-5 per
`Execution_Plan_Team_Task_Matrix.pdf`). This is what's real *today* so nobody is blocked waiting on a rumor.

## For Member 2 (Backend + Database)

- **Formal, real API contract:** `docs/api/ai-contracts.md` — every endpoint, exact request/response JSON,
  error codes, and integration notes (e.g. `/disease/predict` needs multipart upload on your side, not the
  server-local path shape used for local testing). This documents real, tested code
  (`service/main.py`, 6/6 integration tests passing), not a speculative design.
- **Docker:** `docker/Dockerfile` + `docker/docker-compose.yml` are written and path-verified, but **not
  build-tested** — Docker isn't available in the sandbox this was built in. Run `docker build -f
  docker/Dockerfile -t agriconnect-ai .` yourself before relying on it; flag anything that breaks.
- Repo layout at `ai/{price_prediction,disease_detection,rag}` matches Knowledge 02 §3 exactly — your
  `backend/` sits alongside it, not inside it.
- DB entities Knowledge 02 §4 assigns to AI-adjacent tables (`price_observations`, `price_predictions`,
  `disease_predictions`, `scheme_documents`, `scheme_chunks`, `eligibility_rules`) are not built yet on my
  side — I'll confirm exact field-level types once the first real model exists (Week 4), not before, so we
  don't lock a schema against a model that doesn't exist yet.
- Response envelope is already agreed project-wide (`success`, `data`, `error.code`, `error.message`,
  `meta.model_version`) — every AI endpoint I build returns this shape, so your integration code can be
  written once and reused across all 4 endpoints.
- `.env.example` shows what secrets the AI side needs (`DATA_GOV_IN_API_KEY`, `ANTHROPIC_API_KEY`) — useful
  if you're setting up shared secrets management already.

## For Member 3 (Frontend)

- Nothing to integrate against yet — Week 1 for me is architecture + a synthetic-data pipeline proof, not a
  live endpoint. Mock against the contracts in `docs/architecture/decision-log.md` (ADR summaries) and
  `Mandi_Price_Prediction.pdf` §6 / `Crop_Disease_Detection.pdf` in the meantime.
- One thing worth building into every AI-result screen from day one, cheaply, before real models exist:
  copy must say "the model predicts" / "estimated price" / "potentially eligible per current rules" — never
  "your crop has X" or a guaranteed price or an approval. This is a hard acceptance criterion
  (`docs/architecture/decision-log.md` shared responsible-AI floor), easier to bake in now than retrofit later.

## For Member 4 (Data + QA)

- Real, live schema confirmed today from data.gov.in (12 Aug 2026): `state, district, market, commodity,
  variety, grade, arrival_date, min_price, max_price, modal_price` — this is what `ai/common/validation.py`
  checks against, and what any data you pull should match.
- `docs/price/target-and-leakage.md` and `docs/disease/class-shortlist.md` are the specs you'd implement
  against for the Week 1-2 data-cleaning/dataset-audit tasks (`Execution_Plan_Team_Task_Matrix.pdf`, Days 2-3
  in your column) — commodity/market/class shortlists are intentionally left open pending your real coverage
  numbers, not pre-decided by me.
- `docs/rag/source-policy.md` has the starter scheme list (PM-KISAN, PMFBY, KCC, Agriculture Infrastructure
  Fund, selected Andhra Pradesh schemes) and the source-trust hierarchy for when scheme-document collection
  starts (your Day 5 task per the execution plan).
- Provenance fields (`source`, `extracted_at`) are already in the price schema/CSV — reuse the same pattern
  for the scheme corpus and disease-image manifest so `Project_Data_Pack_Schemas.pdf` §4's provenance rule
  ("every external record has a source URL") is satisfied by construction, not bolted on later.
