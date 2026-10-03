# RAG Source Policy & Scheme Knowledge-Base Schema

**Task:** M1-W1-04 (Day 4-5)

## Source hierarchy (Knowledge 07 §3 — in order of trust)
1. Official central/state government sources (pmkisan.gov.in, pmfby.gov.in, myscheme.gov.in, rules.myscheme.gov.in)
2. ICAR / agricultural universities / official extension material (icar.gov.in)
3. Peer-reviewed research
4. Secondary sources — only when clearly labelled as such in the UI, never presented as primary evidence

## Starter scheme set (Knowledge 06 §5 — confirmed from project knowledge, not invented)
- PM-KISAN — **SOURCED** (`data/raw/government_schemes/pm-kisan.json`)
- PMFBY (Pradhan Mantri Fasal Bima Yojana) — **SOURCED**, state-wise notified-crop lists still open (`pmfby.json`)
- Kisan Credit Card / agricultural credit-related schemes — **SOURCED** (`kcc.json`)
- Agriculture Infrastructure Fund — **SOURCED** as of 16 Aug 2026 (`agriculture-infrastructure-fund.json`)
- Selected Andhra Pradesh state schemes — **SOURCED** as of 16 Aug 2026: Annadata Sukhibhava, the successor
  to YSR Rythu Bharosa (`ap-annadata-sukhibhava.json`). Flagged lower-confidence: sources disagree on the
  exact post-2024 benefit amount after the scheme's rename, so the eligibility engine deliberately returns
  `Insufficient information` for this one rather than quoting a specific rupee figure.

All 5 are verified against their official/best-available sources before production use — nothing here is a
finalized legal rule, and Knowledge 06 explicitly forbids inventing eligibility criteria.

## Schema (Knowledge 02 §4 — exact fields, handed to M4 for population and M2 for persistence)
- **scheme_documents:** id, scheme_name, jurisdiction, source_url, verified_at, content_hash, version
- **scheme_chunks:** id, document_id, chunk_text, metadata, embedding_ref
- **eligibility_rules:** id, scheme_id, rule_group, field, operator, value, explanation

## Eligibility output states (Knowledge 01 §6.4 — exactly these four, no fifth state)
`Eligible` / `Potentially eligible` / `Not eligible` / `Insufficient information`

## Baseline definitions handed off with this policy (must be unambiguous enough that M4 could implement
without asking, per M1-W1-04 Definition of Done)
- **Price baseline:** naive / seasonal-naive — last observed value, or same-period-last-cycle value, per series.
- **Disease baseline:** simple CNN (2-4 conv blocks) trained from scratch on a small subset, evaluated before
  any transfer learning is attempted.

## Embeddings blocker — investigation closed, not just deferred (16 Aug 2026)

Checked 5 avenues for a GitHub-hosted (i.e. reachable from this sandbox) substitute for ADR-004's real
multilingual embedding model, the same way `ai/disease_detection/src/model.py` found one for MobileNetV2:

| Option | Result |
|---|---|
| `sentence-transformers` direct | Blocked — `huggingface.co` |
| spaCy multilingual models | Reachable via GitHub, but **rejected on merit** — word vectors aren't cross-lingually aligned, so a Hindi query wouldn't land near an English document's embedding. Using it would look like a fix without being one. |
| LASER (facebookresearch) | Blocked — weights hosted on `dl.fbaipublicfiles.com` |
| fastText official vectors | Blocked — same `dl.fbaipublicfiles.com` |
| BGE-M3 / multilingual-E5 / LaBSE (incl. ONNX variants) | Still fundamentally `huggingface.co`-hosted — unlike MobileNetV2, no equivalent GitHub-release mirror exists for these |

**Conclusion: this blocker is real and not solvable from within this specific sandbox.** Unlike the
MobileNetV2 case, there is no legitimate shortcut here — it needs unrestricted internet, which the user's
own machine already has. Not re-investigating further without a new lead.
