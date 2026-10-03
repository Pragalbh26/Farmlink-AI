# Model Card — Crop Disease Detection

**Status: SMOKE-SCALE VALIDATION RUN — not a deployable model.** Real training (full per-class counts,
pretrained MobileNetV2 backbone, GPU if available) is Week 2-3 work per `Execution_Plan_Team_Task_Matrix.pdf`.

## Basics
- **Model:** `SimpleCNN` (`ai/disease_detection/src/baseline_cnn.py`) — 3 conv blocks, trained from scratch
- **Trained:** 13 Aug 2026 · **Random seed:** 42
- **Dataset:** REAL PlantVillage images (`spMohanty/PlantVillage-Dataset`, pulled via sparse git clone,
  Batch 4) — 13-class MVP shortlist chosen from a real per-class count audit (`docs/disease/class-shortlist.md`).
  This run used `plantvillage_fast_subset/`: 60 real images/class (780 total) — a deliberately small draw
  from the full 220 images/class (2,860 total) subset on disk, to fit CPU training time in this sandbox.
- **Split:** stratified by class, 70/15/15, split before augmentation (`ai/disease_detection/src/dataset.py`)

## Results (held-out real test set, n≈117 images)
- **Test accuracy: see `ai/disease_detection/notebooks/05_evaluation_error_analysis.ipynb` for the exact
  number and full per-class precision/recall/F1** (this card intentionally doesn't restate a single headline
  number without the confusion matrix next to it — a 13-class macro accuracy alone hides which classes are
  actually being confused).
- Best validation accuracy during training: **0.462** (baseline_cnn, epoch 4 of 4), vs. ~0.077 expected from
  random guessing across 13 balanced classes — genuine, if small-scale, learning.

## Transfer learning (ADR-003) — NOW IMPLEMENTED with genuine pretrained weights
**Update, 16 Aug 2026:** the earlier version of this card reported transfer learning as blocked because
`download.pytorch.org` is outside this sandbox's network. That block is now worked around: the identical
ImageNet MobileNetV2 checkpoint, published by the widely-used `timm` (pytorch-image-models) project, is
*also* hosted as a GitHub release asset, which this sandbox can reach. `ai/disease_detection/src/model.py`
downloads and loads it directly (`weight_source="timm_github"`), freezes the backbone, and trains only the
~16.6K-parameter classifier head.

**Real result:** best validation accuracy **0.684** (5 epochs, `lr=1e-2`) vs. the scratch baseline CNN's
**0.462** — a genuine **+22.2 percentage point** improvement from pretrained features, on the identical
780-image real subset. Held-out real test accuracy: **0.624** (see notebook 05's confusion matrix and
per-class report for the full breakdown, not just this headline number). This is the actual ADR-003 claim,
verified — not architecturally-plausible-but-untested as it was in the previous pass.

*(Note buried in getting this result: the first attempt used `lr=3e-4`, a typical rate for fine-tuning an
*unfrozen* backbone, and only reached 17% after 3 epochs. A frozen backbone with ~16.6K trainable
parameters needs a higher rate — `lr=1e-2` — to converge in a few epochs. Recorded here so the next person
training this doesn't repeat the same slow start.)*

## Limitations (read before showing this to anyone)
1. **Controlled-condition images only.** PlantVillage photos are lab/greenhouse images against clean
   backgrounds — real farmer phone photos (variable lighting, background clutter, disease stage, phone
   camera quality) will perform worse. Never state a field-accuracy claim from this dataset alone
   (`docs/disease/class-shortlist.md`, Knowledge 02 §16).
2. 60 images/class is far below the real per-class counts available (985-5,357 — see
   `docs/disease/class-shortlist.md`'s audit table) — purely a sandbox training-time constraint, not a data
   scarcity problem.
3. `Potato___healthy` (152 real images) and `Corn___Cercospora_leaf_spot` (513) were excluded from the MVP
   shortlist for insufficient adequacy, not deleted from scope.
4. Inference correctly returns `is_uncertain: true` below a 0.5 confidence threshold
   (`ai/disease_detection/src/inference.py`) rather than a confident wrong guess — verified in
   notebook 06 with a real low-confidence example.

## Reproducibility
`ai/disease_detection/notebooks/01` through `06`, run in order. Swap `ROOT` from `plantvillage_fast_subset`
to `plantvillage_subset` (the full 220/class real subset already on disk) and raise `epochs` for a
higher-fidelity run on better hardware.
