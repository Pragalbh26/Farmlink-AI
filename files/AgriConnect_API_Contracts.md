# AI Service — API Contracts

**Status: IMPLEMENTED.** This documents `service/main.py` and `service/schemas.py` exactly as they exist and
are tested (`tests/ai/test_service_integration.py`, 6/6 passing) — it is a write-up of real, running code,
not a design speculation that code will later need to match.

Base URL (local dev): `http://localhost:8000` · Run: `uvicorn service.main:app --reload` from the repo root
(or `docker compose -f docker/docker-compose.yml up`, see below — **note:** the Docker setup is written and
path-verified but not build-tested in this sandbox, since Docker itself isn't available here; test a real
`docker build` on your machine before relying on it).

## Response envelope (every endpoint, always)

```json
{
  "success": true,
  "data": { ... endpoint-specific payload, or null on failure ... },
  "error": null,
  "meta": { "model_version": "...", "is_synthetic_model": true }
}
```

On failure, `success: false`, `data: null`, `error: {"code": "...", "message": "..."}`. Error codes currently
in use: `MODEL_NOT_LOADED`, `SERIES_NOT_FOUND`, `IMAGE_NOT_FOUND`, `INDEX_NOT_LOADED`, `UNKNOWN_SCHEME`.

## `GET /health`
No auth, no body. Returns real load status — not a static "ok":
```json
{"price_model_loaded": true, "disease_model_loaded": true, "rag_index_loaded": true}
```
Any `false` here means the corresponding notebook(s) haven't been run yet on this machine — check
`PROGRESS_LEDGER.md` before assuming it's a bug.

## `POST /api/v1/prices/predict`
**Request:**
```json
{"state": "Maharashtra", "market": "Pune Mandi", "commodity": "Onion", "horizon_days": 1}
```
`horizon_days`: 1 or 7 (matches `docs/price/target-and-leakage.md`'s two trained targets).

**Success `data`:**
```json
{
  "commodity": "Onion", "market": "Pune Mandi", "state": "Maharashtra",
  "horizon_days": 1, "forecast_date": "2026-08-17",
  "predicted_price": 1426.02, "unit": "INR/quintal",
  "model_version": "linear_regression_1d_SYNTHETIC",
  "training_cutoff_date": "2026-08-13",
  "uncertainty": null,
  "is_synthetic_model": true
}
```
`is_synthetic_model: true` means this prediction came from the synthetic-fixture-trained model, not real
mandi data — **surface this to the user** (Member 3: don't hide it) until a registered `DATA_GOV_IN_API_KEY`
lets Batch-2/3 notebooks retrain on `real_full` data. `uncertainty` is always `null` today — no
quantile/interval model exists yet.

**Errors:** `SERIES_NOT_FOUND` if the state/market/commodity combination has no history in the current
dataset — this is common right now since the demo backing data is a fixed synthetic grid; check
`/health` and the exact series list before assuming a bug.

## `POST /api/v1/disease/predict`
**Request:** `{"image_path": "/path/to/image.jpg"}`
This is a placeholder request shape for local testing — **Member 2 integration note:** the real backend
almost certainly wants multipart file upload (`UploadFile` in FastAPI) rather than a server-local path;
swapping this is a small, isolated change to `service/schemas.py` + the one endpoint function, not to
`ai/disease_detection/src/inference.py`, which already just takes a `Path`.

**Success `data`:**
```json
{
  "predicted_class": "Corn_(maize)___Common_rust_", "confidence": 0.9991,
  "is_uncertain": false,
  "description": "Closest match in the reference set: Corn (maize) - Common rust .",
  "disclaimer": "AI-generated estimate from a photo, trained on a limited reference dataset...",
  "model_version": "mobilenetv2_transferlearning_REAL_fastsubset",
  "used_pretrained_backbone": true
}
```
When `confidence < 0.5`, `predicted_class` is `null` and `is_uncertain: true` — **always show this state in
the UI, never fall back to displaying the top guess anyway.**

## `POST /api/v1/chat`
**Request:** `{"query": "How much does PM-KISAN pay per year?"}`

**Success `data`:**
```json
{
  "answer": "...", "sources": [{"scheme_name": "...", "source_url": "...", "verified_at": "...", "relevance_score": 0.42}],
  "abstained": false, "abstain_reason": null, "model_version": "claude-sonnet-4-6"
}
```
**Current real behavior (16 Aug 2026): every call returns `abstained: true`, `answer: null`**, because no
`ANTHROPIC_API_KEY` is configured. `sources` is still populated — retrieval works independently of
generation. This is intentional, tested behavior (`test_chat_never_returns_fabricated_answer_without_llm_key`),
not a bug: **never build a frontend fallback that fabricates an answer when this happens.**

## `POST /api/v1/schemes/eligibility`
**Request:**
```json
{
  "scheme_id": "pm-kisan",
  "owns_cultivable_land": true, "is_institutional_landholder": false,
  "is_government_employee_above_group_d": false, "monthly_pension_inr": null,
  "is_registered_professional": false, "pays_income_tax": false,
  "holds_constitutional_or_elected_post": false
}
```
`scheme_id` ∈ `{"pm-kisan", "kcc", "pmfby", "agriculture-infrastructure-fund", "ap-annadata-sukhibhava"}`.
Any profile field can be omitted/`null` — the engine returns `Insufficient information` for what it can't
determine rather than guessing (see `ai/rag/eligibility/rules_engine.py`).

**Success `data`:**
```json
{"scheme_id": "pm-kisan", "status": "Eligible", "reasons": ["..."], "source_url": "https://pmkisan.gov.in"}
```
`status` ∈ exactly `{"Eligible", "Potentially eligible", "Not eligible", "Insufficient information"}` — no
other value is ever returned; **build the UI around these four states, not free text.**

## What's NOT in this contract yet
- Auth/bearer tokens (Knowledge 02 mentions this; not implemented — add when Member 2's backend gateway exists)
- Rate limiting
- Multipart image upload for `/disease/predict` (see note above)
- Request/response logging beyond `ai/common/logging_utils.py`'s stdout logger
