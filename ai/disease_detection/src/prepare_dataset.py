import os
import shutil
from sklearn.model_selection import train_test_split

def split_disease_dataset(raw_dir: str, output_dir: str, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Splits disease image folders into stratified train, val, and test splits.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"
    
    if not os.path.exists(raw_dir):
        print(f"Raw directory '{raw_dir}' not found. Run script locally when raw dataset is downloaded.")
        return

    classes = [d for d in os.listdir(raw_dir) if os.path.isdir(os.path.join(raw_dir, d))]
    
    for cls in classes:
        cls_folder = os.path.join(raw_dir, cls)
        images = [f for f in os.listdir(cls_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        train_imgs, temp_imgs = train_test_split(images, test_size=(val_ratio + test_ratio), random_state=42)
        val_imgs, test_imgs = train_test_split(temp_imgs, test_size=(test_ratio / (val_ratio + test_ratio)), random_state=42)
        
        splits = {'train': train_imgs, 'val': val_imgs, 'test': test_imgs}
        
        for split_name, split_files in splits.items():
            split_cls_dir = os.path.join(output_dir, split_name, cls)
            os.makedirs(split_cls_dir, exist_ok=True)
            
            for file_name in split_files:
                src_path = os.path.join(cls_folder, file_name)
                dst_path = os.path.join(split_cls_dir, file_name)
                shutil.copyfile(src_path, dst_path)
                
    print(f"Dataset successfully split across {len(classes)} classes into '{output_dir}'.")

if __name__ == "__main__":
    print("Disease dataset splitter initialized.")
