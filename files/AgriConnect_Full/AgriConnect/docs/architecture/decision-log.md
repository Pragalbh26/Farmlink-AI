# Architecture Decision Log — AI / ML / NLP (Member 1)

**Task:** M1-W1-01 (Day 1) · **Owner:** Member 1 — Project Lead / AI-ML-NLP Engineer
**Confirmed:** 12 Aug 2026, against `AgriConnect_Member1_Lead_AI_ML_NLP_Plan.pdf` §3 recommendations.

Every non-trivial AI decision (model chosen, backbone chosen, chunking strategy, threshold set) gets one entry
here — what was decided, why, what alternative was rejected. This is what answers viva questions precisely
instead of from memory (Member1 plan §6).

---

## ADR-001 — Price prediction library
**Decision:** pandas + scikit-learn (Linear Regression, Random Forest) + **XGBoost** as the gradient-boosting candidate.
**Why:** Matches the baseline → classical → ML ladder specified in Knowledge 04. Fast to train on tabular mandi
data, easy to defend in a viva, minimal setup.
**Rejected:** LightGBM — equally valid, not rejected on merit, just not the one named first in Knowledge 04 /
the original roadmap doc. One-line swap later if XGBoost gives install trouble.
**Rejected:** Deep learning by default — Knowledge 04 explicitly requires DL to be justified by validation
results, not used by default.

## ADR-002 — Price DL escalation (conditional — not Week 1 work)
**Decision:** PyTorch LSTM/GRU, built **only if** classical ML plateaus and per-series history is long enough.
**Why:** Keeps the option open without pre-committing Week 3-4 time to it.
**Status:** Not started. Needs a written, evidence-based justification before any hours go here (§3).

## ADR-003 — Disease detection framework
**Decision:** PyTorch + torchvision. Transfer learning on **MobileNetV2** (primary backbone), EfficientNet-B0
(comparison candidate).
**Why:** torchvision ships pretrained weights for both. MobileNetV2 explicitly balances accuracy / inference
speed / model size — the deployment priority Knowledge 05 names. Also keeps the whole AI stack on one DL
framework (RAG's `sentence-transformers` is PyTorch-based too), so nobody installs/maintains two.
**Rejected:** ResNet-family — higher ceiling accuracy, but worse size/speed trade-off; deployment-feasibility
priority wins per Knowledge 05.
**Swap allowed:** TensorFlow/Keras, if a teammate has stronger prior experience — no such signal yet, so PyTorch stands (§3).

## ADR-004 — RAG embeddings + vector store
**Decision:** `sentence-transformers` for embeddings + **FAISS** as a local, file-based vector index (Chroma
acceptable fallback if metadata-filtering needs grow beyond FAISS's comfort zone).
**Why:** Zero extra infrastructure to stand up or maintain (Knowledge 01 §9: "use Redis/extra infra only when
justified"), more than sufficient for the 20-40 document knowledge base Knowledge 01 §12 calls for.
**Embedding model:** multilingual-capable, to cover the English + Hindi MVP requirement (Knowledge 07 §6) —
`sentence-transformers/paraphrase-multilingual-mpnet-base-v2` as the starting choice, revisited at the Week 2
retrieval-prototype checkpoint (M1-W2-03) once real retrieval quality can be measured.

## ADR-005 — RAG generation model
**Decision:** Call a hosted LLM through an `LLMAdapter` interface (Knowledge 02 §9) — no self-hosted model.
**Why:** Self-hosting an LLM is out of scope for a 60-day capstone under the "do not introduce unnecessary
technologies" rule. The adapter keeps the provider swappable without touching the rest of the RAG pipeline.
**Provider recorded now:** Anthropic Claude API — lowest-friction path since the project is already being built
inside a Claude Project. Swapping later = editing one adapter file, not the pipeline.
**Non-negotiable adapter behavior:** timeout + retry; on failure, return an explicit error — **never** a
fabricated answer.

## ADR-006 — Experiment tracking
**Decision:** A version-controlled `ai/experiments.csv` (schema in `docs/evaluation/metrics.md`), not a hosted
MLOps platform.
**Why:** Zero setup time, fully sufficient for this project's run volume, diffable in Git — the exact mechanism
the master operating rules require ("never lose track of experiments"). Local MLflow is a defensible P2 upgrade
only if time remains; not needed now.

---

## Scope / process decisions recorded today (12 Aug 2026)

**Decision D1 — Which team-role document is authoritative.**
`Roadmap_of_project.pdf` lists Member 1 as *Frontend & UX Lead* and splits AI work across two separate ML
engineers (M3, M4), on a 22-24 week timeline. This directly conflicts with the current, more specific, and more
recently dated documents — `AgriConnect_Member1_Lead_AI_ML_NLP_Plan.pdf`, `Execution_Plan_Team_Task_Matrix.pdf`
(Knowledge 03), and the user's direct instruction — which all agree: **Member 1 = Project Lead + AI/ML/DL/NLP
Lead**, on a 60-day timeline. Knowledge 03 §2 and the Management Playbook (Doc 2, §1) both explicitly note the
team's *earlier draft plan* deferred RAG to weeks 13-18 and used a different role split — confirming
`Roadmap_of_project.pdf` is that superseded earlier draft. **Resolution: the 60-day, consolidated-AI-under-M1
structure is treated as current and binding for everything in this repo.**

**Decision D2 — Repository layout.**
Knowledge 02 §3 specifies `ai/{price_prediction,disease_detection,rag}` as the top-level AI layout (not a
`ml/` + `nlp/` split). Adopted exactly, with one simplification: per-workstream `data/` subfolders from the
Knowledge 02 example were dropped in favor of a single top-level `data/{raw,processed,metadata}` (also
specified in the same section) — avoids two competing "raw data" locations.

**Decision D3 — This week's pace vs. the Member 1 plan's Week-1 framing.**
`AgriConnect_Member1_Lead_AI_ML_NLP_Plan.pdf` frames Week 1 as definitions-and-architecture-only ("nothing
here trains a model"). But the more granular, self-declared "operational schedule... source of truth"
(`Execution_Plan_Team_Task_Matrix.pdf` / Knowledge 03, §25) puts a **real** price baseline *experiment* on
Day 4, and `Mandi_Price_Prediction.pdf` (Knowledge 04) §8 puts "raw data + quality report + naive baseline" at
Day 7. The current sprint instruction (real code, no stubs pretending to be results) also asks for this pace.
**Resolution: Knowledge 03's daily matrix is treated as binding over the Member 1 plan's more conservative
week-level prose** — Day 1 definitional artifacts (this log, metrics, leakage rules) are produced fast and
cheaply as planned, but real data ingestion and a real baseline are not deferred to Week 2.
