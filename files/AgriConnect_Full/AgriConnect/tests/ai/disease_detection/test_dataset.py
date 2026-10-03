"""tests/ai/disease_detection/test_dataset.py"""
from PIL import Image
from ai.disease_detection.src.dataset import index_dataset, stratified_split, PlantVillageSubset


def _make_fake_dataset(tmp_path, classes_and_counts):
    for cls, count in classes_and_counts.items():
        cls_dir = tmp_path / cls
        cls_dir.mkdir()
        for i in range(count):
            img = Image.new("RGB", (32, 32), color=(i % 255, 0, 0))
            img.save(cls_dir / f"img_{i}.jpg")
    return tmp_path


def test_index_dataset_finds_all_images_and_classes(tmp_path):
    root = _make_fake_dataset(tmp_path, {"ClassA": 5, "ClassB": 3})
    paths, labels, class_to_idx = index_dataset(root)
    assert len(paths) == 8
    assert len(labels) == 8
    assert set(class_to_idx.keys()) == {"ClassA", "ClassB"}
    assert labels.count("ClassA") == 5
    assert labels.count("ClassB") == 3


def test_stratified_split_proportions_and_no_overlap(tmp_path):
    root = _make_fake_dataset(tmp_path, {"ClassA": 40, "ClassB": 40})
    paths, labels, class_to_idx = index_dataset(root)
    train_idx, val_idx, test_idx = stratified_split(paths, labels, seed=42, val_frac=0.2, test_frac=0.2)

    assert len(train_idx) + len(val_idx) + len(test_idx) == len(paths)
    # no index appears in more than one split
    assert set(train_idx).isdisjoint(val_idx)
    assert set(train_idx).isdisjoint(test_idx)
    assert set(val_idx).isdisjoint(test_idx)
    # roughly 60/20/20 - allow slack for small-sample stratification rounding
    assert 0.5 < len(train_idx) / len(paths) < 0.7


def test_stratified_split_keeps_both_classes_in_every_split(tmp_path):
    root = _make_fake_dataset(tmp_path, {"ClassA": 20, "ClassB": 20})
    paths, labels, class_to_idx = index_dataset(root)
    train_idx, val_idx, test_idx = stratified_split(paths, labels, seed=42)
    for idx_list in (train_idx, val_idx, test_idx):
        split_labels = {labels[i] for i in idx_list}
        assert split_labels == {"ClassA", "ClassB"}, "stratification should keep every class represented in every split"


def test_plantvillage_subset_getitem_returns_tensor_and_correct_label(tmp_path):
    root = _make_fake_dataset(tmp_path, {"ClassA": 2})
    paths, labels, class_to_idx = index_dataset(root)
    from ai.disease_detection.src.transforms import eval_transform
    ds = PlantVillageSubset(paths, labels, class_to_idx, transform=eval_transform)
    img_tensor, label = ds[0]
    assert img_tensor.shape == (3, 224, 224)
    assert label == class_to_idx["ClassA"]
