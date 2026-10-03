# AgriConnect — AI / ML / NLP Workstream (Member 1)

Farmer-facing AI for AgriConnect: mandi price prediction, crop disease detection (photo upload), and a
grounded RAG assistant for government-scheme eligibility — the Member 1 (Project Lead + AI/ML/DL/NLP)
slice of the 60-day, 4-member capstone.

This repo covers `ai/` (price prediction, disease detection, RAG) plus the shared `data/` and `docs/`.
`backend/` and `frontend/` are Member 2 and Member 3's repos/folders respectively — integration happens
through the API contracts in `docs/api/` (Knowledge 02 §5 / Knowledge 09), not by importing each other's code.

## Quick start (Windows, conda)

```bat
conda create -n agriconnect python=3.11 -y
conda activate agriconnect
python -m pip install --upgrade pip
pip install -r requirements\required-now.txt
pip install -e .
python -m ipykernel install --user --name agriconnect --display-name "Python (agriconnect)"
python scripts\check_environment.py
jupyter lab
```

Full context and the current ACTION REQUIRED step are in `PROGRESS_LEDGER.md`.

## Structure

```
ai/
├── common/              shared config, logging, validation, io — used by all 3 workstreams
├── price_prediction/    src/ (ingest.py, baseline.py, ...) + notebooks/ + models/ + tests/
├── disease_detection/   src/ (baseline_cnn.py stub, ...) + notebooks/ + models/ + tests/
└── rag/                 src/ + notebooks/ + models/ + tests/   (RAG index / FAISS artifacts)

data/
├── raw/          untouched source data (real seed sample + synthetic fixtures live here, never overwritten)
├── processed/    cleaned / model-ready output of notebooks
└── metadata/     provenance, dataset versions

docs/
├── architecture/decision-log.md     ADR-001..006 + today's scope decisions — READ THIS FIRST
├── evaluation/metrics.md            metrics + experiments.csv schema for all 3 systems
├── price/, disease/, rag/           per-workstream target/leakage/class/source-policy docs
├── api/                             AI service contracts (filled in as endpoints freeze, Week 4-5)
└── handoffs/                        notes for Members 2/3/4

tests/            pytest unit tests, mirrors the ai/ package layout
scripts/          check_environment.py and future CLI utilities
```

Repository layout follows `AgriConnect_Knowledge_02_System_Architecture_Database_API_Blueprint.pdf` §3
exactly (`ai/{price_prediction,disease_detection,rag}`), not a `ml/`+`nlp/` split — see
`docs/architecture/decision-log.md` → Decision D2 for why.

## Notebook → module rule

A notebook stays exploratory until its logic is confirmed correct. At that point the logic moves into
`ai/<workstream>/src/*.py` as tested, reusable code, and the notebook is reduced to *calling* that function.
`ai/price_prediction/src/ingest.py` and `baseline.py` are already there — notebook 01 only calls them.

## Status

`IMPLEMENTED` / `PARTIALLY IMPLEMENTED` / `DESIGNED` / `BLOCKED` - never "done" without evidence.

As of 16 Aug 2026 (Session 2): **price prediction is fully implemented** (6/6 notebooks). **Disease
detection is now fully implemented too** - genuine ImageNet-pretrained transfer learning (val_acc 0.684,
+22.2 points over the scratch baseline), unblocked by sourcing the same weights from a GitHub-hosted mirror
after the primary source was found to be outside this sandbox's network. **RAG is partially implemented**:
5 real, sourced government schemes, a genuinely working deterministic eligibility engine, and retrieval
that works (66.7% top-1 on a TF-IDF fallback, honestly short of what real embeddings would give) - but real
multilingual embeddings and LLM generation both still need resources only available outside this sandbox
(unrestricted internet, and your own Anthropic API key, respectively).

Full state, every real bug found and fixed, and the exact next action are in `PROGRESS_LEDGER.md`.
