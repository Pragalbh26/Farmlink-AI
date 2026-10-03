# Crop Disease Detection — Class Strategy

**Task:** M1-W1-03 (Day 3)

## Source
PlantVillage — **54,306 images, 14 crop species, 26 disease/healthy classes** in controlled conditions
(figure as cited in Knowledge 02 §16). Controlled-condition images differ substantially from farmer
photographs — this domain-shift risk is tracked explicitly (Knowledge 01 §8, Knowledge 02 §16) and must never
be papered over with confident-sounding UI copy.

## Selection rule
Limited, well-represented class set, chosen for **image-count adequacy, not diversity** (Knowledge 01 §6.2).
**Ceiling: fewer than 15 classes for MVP.**

## Starting bias (confirmed against real per-class counts in Batch 4 — 13 Aug 2026)
Crops most relevant to Indian smallholder agriculture that PlantVillage covers with multiple disease classes
each: **Tomato, Potato, Maize (Corn)**.

**Real class-count audit** (full `raw/color` pulled via sparse git clone from `spMohanty/PlantVillage-Dataset`,
confirmed 38 total classes / 14 species, matching the 54,306-image figure in Knowledge 02 §16):

| Class | Images | In MVP shortlist? |
|---|---:|:---:|
| Tomato___Tomato_Yellow_Leaf_Curl_Virus | 5,357 | Yes |
| Tomato___Bacterial_spot | 2,127 | Yes |
| Tomato___Late_blight | 1,909 | Yes |
| Tomato___Septoria_leaf_spot | 1,771 | Yes |
| Tomato___Spider_mites Two-spotted_spider_mite | 1,676 | Yes |
| Tomato___healthy | 1,591 | Yes |
| Tomato___Target_Spot | 1,404 | Yes |
| Corn___Common_rust | 1,192 | Yes |
| Corn___healthy | 1,162 | Yes |
| Tomato___Early_blight | 1,000 | Yes |
| Potato___Late_blight | 1,000 | Yes |
| Potato___Early_blight | 1,000 | Yes |
| Corn___Northern_Leaf_Blight | 985 | Yes |
| Corn___Cercospora_leaf_spot Gray_leaf_spot | 513 | No — below the 900-image adequacy line drawn below |
| Tomato___Leaf_Mold | 952 | No — cut to stay under the 15-class ceiling (13 already chosen) |
| Tomato___Tomato_mosaic_virus | 373 | No — thinnest tomato class |
| Potato___healthy | 152 | No — far below adequacy; revisit once augmentation strategy is validated |

**Rule used:** ≥900 images/class (adequacy threshold, drawn from the natural gap between 985 and 513 in the
real distribution above — not an arbitrary round number), capped at <15 total classes. Result: **13 classes**
(8 tomato + 3 corn + 2 potato). `Potato___healthy` and `Corn___Cercospora_leaf_spot` are logged as excluded-
for-now, not deleted from scope — worth a second look once class-weighting/augmentation is in place (Batch 5).

## Pipeline requirements this shortlist feeds into (Knowledge 05 §3, unchanged, recorded for reference)
- Audit class counts and image quality before anything else.
- Remove corrupted files and obvious duplicates.
- Split correctly, **then** augment — augmentation is train-only.
- Track and report class imbalance rather than hiding it.

## Output contract (Knowledge 05 §2 / Knowledge 02 §7)
Prediction + confidence/reliability + description + disclaimer. Low-confidence inputs return an explicit
**uncertain** state, never a confident-sounding guess.
