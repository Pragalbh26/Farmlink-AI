# PlantVillage Crop Disease Dataset Audit

This document logs the raw quality check, class distributions, and integrity verification for leaf disease images.

## Dataset Overview
* **Primary Source:** PlantVillage Public Dataset + Local Field Extensions
* **Total Image Count:** ~54,300 images
* **Target Crops:** Tomato, Potato, Corn, Apple, Grape, Pepper

## Class Distribution & Imbalance Audit

| Class Name | Raw Image Count | Target Min Count | Imbalance Flag | Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| `Tomato___Bacterial_spot` | 2,127 | 1,000 | Balanced | None |
| `Tomato___Early_blight` | 1,000 | 1,000 | Balanced | None |
| `Tomato___Late_blight` | 1,909 | 1,000 | Balanced | None |
| `Tomato___Leaf_Mold` | 952 | 1,000 | Slight Under-represented | Augment in Train split |
| `Tomato___Septoria_leaf_spot` | 1,776 | 1,000 | Balanced | None |
| `Tomato___Spider_mites` | 1,676 | 1,000 | Balanced | None |
| `Tomato___Target_Spot` | 1,404 | 1,000 | Balanced | None |
| `Tomato___Yellow_Leaf_Curl_Virus` | 3,209 | 1,000 | Over-represented | Cap validation set size |
| `Tomato___healthy` | 1,591 | 1,000 | Balanced | None |

## Integrity & Quality Checks
1. **Corrupt Files:** Scan for non-JPEG/PNG headers or zero-byte images.
2. **Duplicate Images:** Check image MD5 hashes across folders to eliminate exact duplicates.
3. **Split Integrity:** Guarantee test/validation images are strictly held out before any augmentation pipeline runs.
