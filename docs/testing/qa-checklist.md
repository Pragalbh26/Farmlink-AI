# Week 1 QA Checklist & Data Quality Gate

This checklist verifies that all core datasets, registries, and cleaning pipelines meet project standards before model training begins.

## Quality Gates Checklist
- [x] **Registry Completeness:** All 5 core data sources logged in `data/metadata/dataset-registry.md`.
- [x] **Provenance Tracking:** Template created in `data/metadata/provenance-template.md`.
- [x] **Schema Definitions:** Mandi price schema defined in `docs/data/price-data-dictionary.md`.
- [x] **Image Audit:** Class distributions and integrity rules logged in `docs/data/disease-dataset-audit.md`.
- [x] **Pipeline Executability:** Idempotent cleaning scripts written in `data/processed/`.
- [x] **Scheme Sources:** Metadata logged in `data/metadata/scheme-sources.csv`.

## Non-Negotiable Data Rules
1. Missing mandi prices are never zero-filled.
2. Training/validation splits are strictly isolated before image augmentation.
3. Every scheme document contains a valid source URL and `verified_at` timestamp.
