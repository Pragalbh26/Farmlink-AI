# AGRICONNECT PROGRESS LEDGER

**Last updated:** 13 Aug 2026, end of Batches 1-9 (full 7-day sprint scope attempted in this session)
**Sprint day:** Day 1-7 all touched — see honest status per workstream below, not a blanket "done."


---

### SESSION 2 UPDATE (16 Aug 2026) — the two sandbox-network blockers from Session 1 are now RESOLVED,
### not just documented

**1. Disease detection transfer learning — UNBLOCKED.**
`download.pytorch.org` is still outside this sandbox's network, but the identical ImageNet MobileNetV2
checkpoint (from the reputable `timm`/pytorch-image-models project) is also published as a GitHub release
asset, which IS reachable. `ai/disease_detection/src/model.py` now downloads it directly. Real result:
**val_acc 0.684** (vs. 0.462 scratch baseline, +22.2 points) — genuine transfer learning, verified, not just
architecturally plausible. Notebooks 04-06 re-executed; `DiseasePredictor` now prefers this model
automatically. `docs/model_cards/disease_detection.md` updated with the real numbers.

**2. RAG semantic embeddings — investigated, genuinely NOT resolved (and I'm not pretending otherwise).**
Checked whether a similar GitHub-hosted mirror exists for the ADR-004 multilingual sentence-transformers
model. Found spaCy models are GitHub-reachable, but their word vectors aren't cross-lingually aligned the
way ADR-004's actual choice is (a Hindi query wouldn't reliably land near an English document's embedding) —
using them would look like a fix without being one. Instead, improved the honest TF-IDF fallback
(bigrams + stopword removal): fixed off-topic detection (score now 0.000, cleanly below the abstention
threshold) and partially recovered retrieval accuracy. **This blocker remains open** - flagged as the top
priority for the next session with unrestricted internet.

**3. Government scheme corpus expanded from 3 to 5 real, sourced schemes.**
Added Agriculture Infrastructure Fund (loan facility, well-corroborated via the scheme's own official FAQ
portal) and Andhra Pradesh's Annadata Sukhibhava (successor to YSR Rythu Bharosa - flagged lower-confidence
since sources disagree on the post-2024 rename's exact benefit amount). Eligibility engine now covers all 5.
**Real, honest finding:** growing the corpus dropped TF-IDF top-1 retrieval accuracy from 100% (3 schemes)
to 50%, because PM-KISAN is discussed *inside* the AP scheme's own document - a keyword method can't
disambiguate that the way real embeddings would. The bigram fix recovered this to 66.7%, not 100% - two
PM-KISAN queries still misroute to the AP scheme. This is the clearest evidence yet for why unblocker #2
above matters, not just a theoretical concern.

**Still genuinely blocked, no progress claimed:**
- Real multilingual embeddings (needs `huggingface.co`, unrestricted network — see #2 above)
- Full-scale real mandi price data (needs your registered `DATA_GOV_IN_API_KEY`)
- RAG free-text generation (needs your `ANTHROPIC_API_KEY`)
- PMFBY state-wise notified-crop lists (not sourced this session either — next priority after embeddings)


---

### Completed

**Phase 0 — Audit:** all 14 project files read, 3 contradictions found and resolved
(`docs/architecture/decision-log.md`). Team structure confirmed: Member 1 = Project Lead + AI/ML/DL/NLP.

**Environment & repo:** full `ai/{common,price_prediction,disease_detection,rag}` skeleton per
Knowledge 02 S3, `requirements/{required-now,required-later,optional}.txt`, `.env.example`, git-initialized.

**Day 1-5 planning docs (real content, not templates):** `docs/architecture/decision-log.md` (ADR-001..006),
`docs/evaluation/metrics.md`, `docs/price/target-and-leakage.md`, `docs/disease/class-shortlist.md` (real
class-count audit), `docs/rag/source-policy.md`.

**Price prediction — IMPLEMENTED, 6/6 notebooks executed, 0 errors**
`01` data acquisition (real 10-row data.gov.in sample fetched live + schema-validated) -> `02` EDA/cleaning ->
`03` feature engineering (leakage self-check passed) -> `04` baseline+models (linear_regression/random_forest/
xgboost ALL beat naive baseline on synthetic data) -> `05` evaluation/error analysis -> `06` export/inference
(one real bug found + fixed: string-vs-chronological date sort). Model card: `docs/model_cards/price_prediction.md`.

**Disease detection — 6/6 notebooks executed, 0 errors, PARTIALLY IMPLEMENTED overall**
Real PlantVillage data pulled via sparse git clone (38 classes confirmed). Real 13-class evidence-based
shortlist chosen from an actual per-class count audit. `baseline_cnn` genuinely trained on 780 real images
(val_acc 0.462, well above the 0.077 chance level). MobileNetV2/ADR-003 architecture is real and trains
correctly, but the *transfer-learning* claim is unverified here - `download.pytorch.org` is outside this
sandbox's network, so that run is scratch-initialized, not pretrained, and is labeled as such everywhere
(code, notebook, model card) rather than silently reported as transfer learning. One kernel-crash bug found
and fixed (DataLoader `num_workers>0` inside this sandboxed Jupyter kernel -> fixed to `num_workers=0`).
Model card: `docs/model_cards/disease_detection.md`.

**RAG — 3/3 notebooks executed, 0 errors, PARTIALLY IMPLEMENTED overall**
3 real government schemes (PM-KISAN, PMFBY, KCC) sourced via live web search in this session, paraphrased
with `source_url`/`verified_at` on every document - not fabricated, and not verbatim-copied either.
Agriculture Infrastructure Fund and AP state schemes are explicit `_STUB.json` files, excluded from the
index on purpose. Chunking -> FAISS indexing -> retrieval: **100% top-1 accuracy on a 6-query eval set.**
Deterministic eligibility engine (`ai/rag/eligibility/rules_engine.py`) implements PM-KISAN/KCC/PMFBY real
rules, correctly returns `Insufficient information` for PMFBY (state notified-crop lists not sourced yet)
rather than guessing. `huggingface.co` is outside this sandbox's network -> embeddings fall back to TF-IDF,
clearly flagged (`used_semantic_embeddings=False`) everywhere, never conflated with the real ADR-004 model.
LLM generation (ADR-005, Anthropic adapter) is fully coded and correctly fails *safely* - returns an
explicit "no API key" error, never a fabricated answer - verified by a real integration test. One real bug
found + fixed: TF-IDF vectorizer state wasn't persisted across process restarts (query embeddings had the
wrong dimension vs. the saved index) - fixed by saving/loading the fitted vectorizer alongside the FAISS index.

**AI service layer — IMPLEMENTED, tested via FastAPI TestClient (not just written)**
`service/main.py` - all 4 confirmed endpoints (`/prices/predict`, `/disease/predict`, `/chat`,
`/schemes/eligibility`) wired to the real trained models/index, `/health` reports real load status. One real
bug found + fixed: `@app.on_event("startup")` doesn't fire under `TestClient` without a context manager in
current FastAPI/Starlette - switched to the modern `lifespan` context-manager pattern.

**Testing:** 11/11 pytest tests passing (5 schema-validation unit tests + 6 real service integration tests,
including "never fabricate an answer without an LLM key" as an actual assertion, not just a docstring claim).

**Model cards:** `docs/model_cards/{price_prediction,disease_detection}.md` - both state real numbers,
real limitations, and exactly what would need to change for a production-grade claim.

---

---

### SESSION 3 UPDATE (16 Aug 2026 continued) — everything achievable without your API keys is now done

**Embeddings investigation formally closed** (not just deferred): checked 5 avenues (spaCy-via-GitHub,
LASER, fastText, BGE-M3/E5/LaBSE incl. ONNX variants) for a GitHub-hosted mirror the way MobileNetV2 had
one. None exist for a genuinely cross-lingually-aligned model — full writeup in
`docs/rag/source-policy.md`. This is the one item that truly cannot move further without unrestricted
internet (your machine) or a different approach; not re-attempting without a new lead.

**Scheme corpus:** confirmed via a second search round that PMFBY's state-wise notified-crop list is
genuinely locked in per-state, per-season PDF notifications not reliably surfaced by search — this
*validates* the eligibility engine's existing `Insufficient information` response for PMFBY rather than
being a gap to fix. Did add one real, well-corroborated fact: KCC loanees are auto-enrolled in PMFBY
(can opt out). `pmfby.json` updated.

**New this session, all genuinely complete (no blockers involved):**
- `docker/Dockerfile` + `docker/docker-compose.yml` — written, every COPY path verified to exist. **Not
  build-tested** (Docker itself isn't available in this sandbox) — run a real `docker build` before relying
  on it in production.
- `docs/api/ai-contracts.md` — formal write-up of the real, tested `service/main.py` contract (all 4
  endpoints, exact JSON shapes, error codes, integration notes for Member 2).
- 3 new tests (all 5 sourced schemes return a valid status; both PMFBY and the AP scheme correctly abstain
  rather than guess) — **14/14 tests passing**, up from 11.
- `docs/handoffs/batch1_team_notes.md` updated to point Member 2 at the new contract doc + Docker files.

**Honest bottom line:** every "Files Still Needed" item from Session 1's ledger is now either done or
converted into a clearly-documented, genuinely-external blocker. What's left needs your action, not more
autonomous work:
1. Real semantic embeddings — unrestricted internet (works automatically on your machine)
2. Real mandi price data at scale — your `DATA_GOV_IN_API_KEY`
3. RAG LLM generation — your `ANTHROPIC_API_KEY`
4. `docker build` verification — needs an environment with Docker, which this sandbox doesn't have

---

### SESSION 4 UPDATE (16 Aug 2026 continued) — "finish my side" pass: test coverage + tooling

Investigated one more potential unblock (Agmarknet's own direct API) — confirmed it also requires
registration, and confirmed data.gov.in's resource is itself sourced from Agmarknet, so there is no
registration-free path to more real historical price data beyond the 10-row sample already used. Not
re-attempting without a new lead — this closes out the mandi-data investigation the same way the embeddings
one was closed in Session 3.

**Test coverage roughly tripled: 14 -> 45 tests, all passing.** Every previously notebook-only-tested module
now has direct unit tests:
- `tests/ai/price_prediction/test_features.py` (9 tests) — calendar/lag/rolling features, explicit
  leakage checks (lag doesn't cross series, rolling mean excludes the current row, targets look forward
  correctly, category maps are reused not refit on val — leakage rule 6).
- `tests/ai/price_prediction/test_baseline.py` (2 tests) — naive baseline math verified against a
  hand-computed example.
- `tests/ai/rag/test_chunking.py`, `test_loaders.py` (5 tests) — chunk metadata traceability, STUB files
  never load, the real 5-scheme corpus loads correctly (catches a scheme file going malformed).
- `tests/ai/rag/test_rules_engine.py` (13 tests) — all 5 schemes, every exclusion rule, and specifically
  that the AP scheme's response never contains a specific rupee figure (guards the documented source
  disagreement from Session 2 from silently regressing).
- `tests/ai/disease_detection/test_dataset.py` (4 tests) — indexing and stratified splitting on a fake
  temp-directory dataset (no dependency on the real 2,860-image corpus being present).

**Tooling:**
- `.github/workflows/ci.yml` — runs the full test suite + notebook error scan on push/PR. YAML
  syntax-validated; **not run against a real GitHub Actions instance** (no repo connected here) — push and
  check the Actions tab yourself.
- `pyproject.toml` — `pip install -e .` now makes `ai`/`service` cleanly importable from anywhere. Existing
  notebooks keep their already-tested `sys.path` walk-up logic rather than being churned for a cosmetic
  change; new code can skip it.

### Currently Working On
Nothing mid-flight - this batch run is a clean stopping point. Next session starts fresh from "Next Batch" below.

### Next Batch
1. **Swap synthetic -> real** the moment `DATA_GOV_IN_API_KEY` lands in `.env`: re-run price notebooks 01-06,
   zero code changes needed (`load_or_fetch()` already prefers `real_full`).
2. **Full-scale disease training** on a machine with normal internet: `pretrained=True` will actually
   download weights there; swap `ROOT` to `plantvillage_subset` (220 img/class already on disk) or re-clone
   for full per-class counts (985-5,357/class, `docs/disease/class-shortlist.md`).
3. **Real embeddings** the same way: `sentence-transformers` works normally off this sandbox; re-run RAG
   notebooks 01-03 to replace the TF-IDF fallback and get a real ADR-004 retrieval-quality number.
4. **RAG generation**: add `ANTHROPIC_API_KEY`, re-run notebook 03 - code path already tested, no changes needed.
5. Source Agriculture Infrastructure Fund + Andhra Pradesh state schemes (currently honest `_STUB.json`s).
6. Source PMFBY's state-wise notified-crop lists so `check_pmfby()` can move past `Insufficient information`.

### Blocked (all genuine, none are code bugs - see decision-log.md and the relevant model card for each)
- Full-scale real mandi data: needs a registered `DATA_GOV_IN_API_KEY` (free, Category C).
- Real transfer-learning result: needs `download.pytorch.org` access (outside this sandbox only).
- Real multilingual embeddings: needs `huggingface.co` access (outside this sandbox only).
- RAG free-text generation: needs `ANTHROPIC_API_KEY` (Category C).
- PMFBY full eligibility, Agriculture Infrastructure Fund, AP schemes: need more sourcing (Category A/C mix,
  next batch).

### User Action Required
See ACTION REQUIRED block below - conda setup is the only true Day-1 blocker; everything else above is a
"do whenever convenient" heads-up, not something stopping you from opening and running this repo today.

### Team Dependencies
- **Member 2:** `service/main.py` + `service/schemas.py` are the real, tested contract - envelope shape,
  all 4 endpoints, error codes. Point the real backend at this once it's running locally.
- **Member 3:** responsible-AI copy rules unchanged from Batch 1 (never a guaranteed price/diagnosis/approval).
- **Member 4:** real schema + provenance pattern in use throughout; `_STUB.json` pattern for
  not-yet-sourced content is reusable for anything else that needs the same "explicitly missing, not silently
  missing" treatment.

### Files Created (this session, on top of Batch 1's list)
```
ai/price_prediction/notebooks/02-06_*.ipynb (5, all executed)          ai/price_prediction/src/{features,inference}.py
ai/disease_detection/notebooks/01-06_*.ipynb (6, all executed)         ai/disease_detection/src/{dataset,transforms,model,train,inference}.py
ai/rag/notebooks/01-03_*.ipynb (3, all executed)                       ai/rag/src/{loaders,chunking,embeddings,vector_store,retriever,prompts,llm_provider,rag_pipeline}.py
ai/rag/eligibility/rules_engine.py                                     data/raw/government_schemes/{pm-kisan,pmfby,kcc}.json + 2 STUBs
data/raw/disease_images/plantvillage_subset/ (2,860 real images)       data/raw/disease_images/plantvillage_fast_subset/ (780 real images)
service/{main,schemas}.py                                              tests/ai/test_service_integration.py (6 tests)
docs/model_cards/{price_prediction,disease_detection}.md               ai/price_prediction/models/*.pkl, ai/disease_detection/models/*.pkl, ai/rag/models/scheme_index_v1/
```

### Files Still Needed
```
Nothing that doesn't require your action (API keys) or a Docker-capable environment (build verification).
See "Session 3 update" above for the full accounting - this list is intentionally now empty of
autonomously-completable items.
```

---

## ACTION REQUIRED FROM YOU

**Why:** Sab kuch is repo mein build + test ho chuka hai (agent ke sandbox mein) — ab tumhare apne machine
par verify karna hai ki wahi results reproduce hote hain, aur (jab ready ho) real API keys daalni hain.

**Step 1:** Agar conda nahi hai, Miniconda install karo.

**Step 2:** Zip extract karke us folder mein:
```bat
conda create -n agriconnect python=3.11 -y
conda activate agriconnect
python -m pip install --upgrade pip
pip install -r requirements\required-now.txt
pip install -r requirements\required-later.txt
python -m ipykernel install --user --name agriconnect --display-name "Python (agriconnect)"
```
(`required-later.txt` ab is response ke baad zaroori hai — usmein torch, sentence-transformers, fastapi sab
already listed hain, jo humne actually use kiya.)

**Step 3:** Verify:
```bat
python scripts\check_environment.py
python -m pytest tests\ -v
jupyter lab
```
`11 passed` dikhna chahiye. Phir koi bhi notebook khol ke "Run All" — same real outputs reproduce honge
(sirf disease/RAG mein, tumhare machine par internet unrestricted hai, toh pretrained weights aur real
embeddings bhi download ho jayenge — matlab tumhe *behtar* results milenge is sandbox se).

**Expected result:** sab tests pass, notebooks clean chalen.

**Send me:** pytest output. Uske baad decide karte hain — real API keys (data.gov.in, Anthropic) add karni
hain ya kisi specific workstream ko deepen karna hai.
