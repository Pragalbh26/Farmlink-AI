"""
ai/disease_detection/src/inference.py

Inference matching the confirmed API contract (Knowledge 05 S2 / Knowledge 02 S7):
prediction + confidence/reliability + description + disclaimer. Low-confidence
inputs return an explicit "uncertain" state, never a confident-sounding guess.
"""
from __future__ import annotations

import pickle
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

import torch
import torch.nn.functional as F
from PIL import Image

from ai.common.config import PROJECT_ROOT
from ai.disease_detection.src.baseline_cnn import build_baseline_cnn
from ai.disease_detection.src.transforms import eval_transform

MODEL_DIR = PROJECT_ROOT / "ai" / "disease_detection" / "models"
CONFIDENCE_THRESHOLD = 0.5  # below this, return "uncertain" rather than a guess

# Preferred model order: real transfer learning beats the scratch baseline
# (0.684 vs 0.462 val_acc - see docs/model_cards/disease_detection.md), so
# load_latest() prefers it when both exist, rather than just picking the
# most recently-modified file.
PREFERRED_MODEL_GLOBS = [
    "mobilenetv2_transferlearning_REAL_*.pkl",
    "mobilenetv2_scratch_fallback_REAL_*.pkl",
    "baseline_cnn_*.pkl",
]


@dataclass
class DiseasePrediction:
    predicted_class: Optional[str]
    confidence: float
    is_uncertain: bool
    description: str
    disclaimer: str
    model_version: str
    used_pretrained_backbone: bool

    def to_dict(self) -> dict:
        return asdict(self)


DISCLAIMER = (
    "AI-generated estimate from a photo, trained on a limited reference dataset under controlled "
    "conditions. Field photos vary a lot (lighting, background, disease stage) - treat this as a "
    "starting point, not a diagnosis. Confirm with your local agricultural extension officer before "
    "acting, especially before any pesticide/fungicide purchase."
)


def _build_model_for_checkpoint(ckpt: dict, num_classes: int):
    """The two model families this project has trained (timm MobileNetV2 vs.
    the scratch SimpleCNN) have different state_dict key prefixes - detect
    which one a checkpoint belongs to rather than assuming."""
    keys = set(ckpt["state_dict"].keys())
    if any(k.startswith("conv_stem") or k.startswith("blocks") for k in keys):
        import timm
        return timm.create_model("mobilenetv2_100", pretrained=False, num_classes=num_classes)
    return build_baseline_cnn(num_classes=num_classes)


class DiseasePredictor:
    def __init__(self, model_path: Path):
        with open(model_path, "rb") as f:
            ckpt = pickle.load(f)
        self.class_to_idx = ckpt["class_to_idx"]
        self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}
        self.model = _build_model_for_checkpoint(ckpt, num_classes=len(self.class_to_idx))
        self.model.load_state_dict(ckpt["state_dict"])
        self.model.eval()
        self.model_version = model_path.stem
        self.used_pretrained_backbone = ckpt.get("used_pretrained", False)
        self.weight_source = ckpt.get("weight_source", "scratch" if not self.used_pretrained_backbone else "unknown")

    @classmethod
    def load_latest(cls) -> "DiseasePredictor":
        for pattern in PREFERRED_MODEL_GLOBS:
            candidates = sorted(MODEL_DIR.glob(pattern))
            if candidates:
                return cls(candidates[-1])
        raise FileNotFoundError(f"No trained disease model in {MODEL_DIR} - run notebook 03 or 04 first.")

    @torch.no_grad()
    def predict(self, image_path: Path) -> DiseasePrediction:
        img = Image.open(image_path).convert("RGB")
        tensor = eval_transform(img).unsqueeze(0)
        logits = self.model(tensor)
        probs = F.softmax(logits, dim=1)[0]
        top_prob, top_idx = probs.max(dim=0)
        confidence = float(top_prob)
        is_uncertain = confidence < CONFIDENCE_THRESHOLD

        return DiseasePrediction(
            predicted_class=None if is_uncertain else self.idx_to_class[int(top_idx)],
            confidence=round(confidence, 4),
            is_uncertain=is_uncertain,
            description=(
                "Confidence below threshold - showing this as uncertain rather than a specific "
                "diagnosis." if is_uncertain else
                f"Closest match in the reference set: {self.idx_to_class[int(top_idx)].replace('___', ' - ').replace('_', ' ')}."
            ),
            disclaimer=DISCLAIMER,
            model_version=self.model_version,
            used_pretrained_backbone=self.used_pretrained_backbone,
        )
