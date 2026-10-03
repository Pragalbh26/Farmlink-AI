"""
ai/disease_detection/src/baseline_cnn.py

Simple CNN, 2-4 conv blocks (Knowledge 05), trained from scratch on the
real PlantVillage MVP subset (docs/disease/class-shortlist.md, 13 classes).
Was an honest architecture-only STUB through Batch 1 (no torch/data yet);
implemented for real in Batch 5 once both existed - see PROGRESS_LEDGER.md
for exactly when this changed.

Purpose: give transfer learning (model.py, ADR-003) something concrete to
beat. Input size 224x224x3, shared with the MobileNetV2 pipeline so
preprocessing does not fork between the two notebooks.
"""
import torch.nn as nn

INPUT_SIZE = (224, 224)


class SimpleCNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # 224 -> 112
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 112 -> 56
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 56 -> 28
            nn.AdaptiveAvgPool2d((7, 7)),  # keeps the classifier head a fixed size regardless of input res
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 128), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)


def build_baseline_cnn(num_classes: int) -> nn.Module:
    return SimpleCNN(num_classes)
