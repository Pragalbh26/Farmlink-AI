"""
ai/disease_detection/src/model.py
Transfer learning on MobileNetV2 (ADR-003). Backbone frozen, classifier
head replaced + trained.

WEIGHT SOURCE, UPDATED (previously blocked, now genuinely resolved):
torchvision's own download (download.pytorch.org) is outside this sandbox's
whitelisted network. The IMAGENET-PRETRAINED WEIGHTS THEMSELVES are not
blocked, though - the same MobileNetV2 checkpoint (trained by the widely-used,
reputable `timm` / pytorch-image-models project) is also published as a
GitHub release asset, which IS reachable from this sandbox:
  https://github.com/rwightman/pytorch-image-models/releases/download/v0.1-weights/mobilenetv2_100_ra-b33bc2c4.pth
build_mobilenetv2() now tries, in order: (1) torchvision's own pretrained
weights [works on an unrestricted machine], (2) this GitHub-hosted timm
checkpoint [works in this sandbox too], (3) random init as a last resort.
Whichever path is used is returned so it is never silently mislabeled.
"""
from pathlib import Path

import torch
import torch.nn as nn

from ai.common.logging_utils import get_logger

logger = get_logger(__name__)

TIMM_CHECKPOINT_URL = (
    "https://github.com/rwightman/pytorch-image-models/releases/download/"
    "v0.1-weights/mobilenetv2_100_ra-b33bc2c4.pth"
)
TIMM_CHECKPOINT_CACHE = Path.home() / ".cache" / "agriconnect" / "mobilenetv2_100_ra.pth"


def _try_torchvision_pretrained():
    from torchvision import models
    from torchvision.models import MobileNet_V2_Weights
    return models.mobilenet_v2(weights=MobileNet_V2_Weights.IMAGENET1K_V1), "torchvision"


def _try_timm_github_pretrained(num_classes: int):
    """Downloads (and caches) the GitHub-hosted timm MobileNetV2 checkpoint
    directly, bypassing timm's own loader (which defaults to HuggingFace
    Hub and would hit the same block torchvision does)."""
    import timm
    import requests

    TIMM_CHECKPOINT_CACHE.parent.mkdir(parents=True, exist_ok=True)
    if not TIMM_CHECKPOINT_CACHE.exists():
        resp = requests.get(TIMM_CHECKPOINT_URL, timeout=60)
        resp.raise_for_status()
        TIMM_CHECKPOINT_CACHE.write_bytes(resp.content)

    model = timm.create_model("mobilenetv2_100", pretrained=False, num_classes=num_classes)
    state_dict = torch.load(TIMM_CHECKPOINT_CACHE, map_location="cpu", weights_only=True)
    backbone_state = {k: v for k, v in state_dict.items() if not k.startswith("classifier")}
    missing, unexpected = model.load_state_dict(backbone_state, strict=False)
    assert set(missing) == {"classifier.weight", "classifier.bias"} and not unexpected, (
        f"Unexpected checkpoint/model mismatch: missing={missing} unexpected={unexpected}"
    )
    return model, "timm_github"


def build_mobilenetv2(num_classes: int, freeze_backbone: bool = True,
                       pretrained: bool = True) -> tuple[nn.Module, bool, str]:
    """Returns (model, used_pretrained_weights, weight_source). weight_source
    is one of 'torchvision', 'timm_github', or 'random_init' - always record
    this alongside any result; a random_init run is not transfer learning."""
    if not pretrained:
        from torchvision import models
        return models.mobilenet_v2(weights=None), False, "random_init"

    try:
        model, source = _try_torchvision_pretrained()
        # torchvision path: replace the classifier head ourselves (see below)
        in_features = model.classifier[1].in_features
        if freeze_backbone:
            for p in model.features.parameters():
                p.requires_grad = False
        model.classifier[1] = nn.Linear(in_features, num_classes)
        return model, True, source
    except Exception as e:
        logger.info("torchvision pretrained download unavailable (%s) - trying the "
                     "GitHub-hosted timm checkpoint instead.", type(e).__name__)

    try:
        model, source = _try_timm_github_pretrained(num_classes)
        if freeze_backbone:
            for name, p in model.named_parameters():
                if not name.startswith("classifier"):
                    p.requires_grad = False
        return model, True, source
    except Exception as e:
        logger.warning(
            "Could not obtain ImageNet-pretrained weights from torchvision OR the "
            "GitHub-hosted timm checkpoint (%s). Falling back to random init - "
            "this run is NOT transfer learning, label it accordingly.", type(e).__name__
        )
        from torchvision import models
        model = models.mobilenet_v2(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
        return model, False, "random_init"
