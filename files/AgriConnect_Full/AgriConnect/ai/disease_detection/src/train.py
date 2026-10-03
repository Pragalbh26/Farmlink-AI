"""ai/disease_detection/src/train.py"""
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader


def train_one_epoch(model, loader: DataLoader, optimizer, device) -> float:
    model.train()
    criterion = nn.CrossEntropyLoss()
    total_loss = 0.0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(loader.dataset)


@torch.no_grad()
def evaluate_loss_acc(model, loader: DataLoader, device) -> tuple[float, float]:
    model.eval()
    criterion = nn.CrossEntropyLoss()
    total_loss, correct, n = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)
        total_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        n += images.size(0)
    return total_loss / n, correct / n


def fit(model, train_loader, val_loader, device, epochs: int = 5, lr: float = 1e-3):
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)
    history = []
    for epoch in range(1, epochs + 1):
        t0 = time.time()
        train_loss = train_one_epoch(model, train_loader, optimizer, device)
        val_loss, val_acc = evaluate_loss_acc(model, val_loader, device)
        elapsed = time.time() - t0
        history.append({"epoch": epoch, "train_loss": train_loss, "val_loss": val_loss,
                         "val_acc": val_acc, "seconds": elapsed})
        print(f"epoch {epoch}/{epochs}  train_loss={train_loss:.4f}  "
              f"val_loss={val_loss:.4f}  val_acc={val_acc:.4f}  ({elapsed:.1f}s)")
    return history
