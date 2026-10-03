"""
ai/disease_detection/src/dataset.py

PyTorch Dataset for the PlantVillage MVP subset (docs/disease/class-shortlist.md).
Split is stratified by class and done BEFORE augmentation is attached
(Knowledge 05 S3 / docs/disease/class-shortlist.md pipeline requirement).
"""
from __future__ import annotations

from pathlib import Path
from typing import Callable, Optional

from PIL import Image
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split


def index_dataset(root: Path) -> tuple[list[Path], list[str], dict[str, int]]:
    """Walks root/<class_name>/*.jpg and returns (paths, labels, class_to_idx)."""
    classes = sorted([d.name for d in root.iterdir() if d.is_dir()])
    class_to_idx = {c: i for i, c in enumerate(classes)}
    paths, labels = [], []
    for c in classes:
        for ext in ("*.jpg", "*.JPG", "*.png"):
            for f in (root / c).glob(ext):
                paths.append(f)
                labels.append(c)
    return paths, labels, class_to_idx


def stratified_split(paths: list[Path], labels: list[str], seed: int = 42,
                      val_frac: float = 0.15, test_frac: float = 0.15):
    """Stratified by class, split BEFORE augmentation is ever applied."""
    idx = list(range(len(paths)))
    train_idx, temp_idx = train_test_split(idx, test_size=val_frac + test_frac,
                                            stratify=labels, random_state=seed)
    temp_labels = [labels[i] for i in temp_idx]
    rel_test = test_frac / (val_frac + test_frac)
    val_idx, test_idx = train_test_split(temp_idx, test_size=rel_test,
                                          stratify=temp_labels, random_state=seed)
    return train_idx, val_idx, test_idx


class PlantVillageSubset(Dataset):
    def __init__(self, paths: list[Path], labels: list[str], class_to_idx: dict[str, int],
                 transform: Optional[Callable] = None):
        self.paths = paths
        self.labels = labels
        self.class_to_idx = class_to_idx
        self.transform = transform

    def __len__(self) -> int:
        return len(self.paths)

    def __getitem__(self, i: int):
        img = Image.open(self.paths[i]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        label = self.class_to_idx[self.labels[i]]
        return img, label
