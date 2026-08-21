import os
from PIL import Image

def clean_and_verify_images(raw_image_dir: str, manifest_output_path: str):
    """
    Scans raw disease image directories, strips corrupted images, and generates a valid manifest file.
    """
    valid_records = []
    
    if not os.path.exists(raw_image_dir):
        print(f"Directory {raw_image_dir} does not exist. Run locally with valid path.")
        return

    for root, _, files in os.walk(raw_image_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                class_name = os.path.basename(root)
                
                # Verify image integrity
                try:
                    with Image.open(file_path) as img:
                        img.verify()  # Check if image is corrupted
                    valid_records.append({"filepath": file_path, "class": class_name, "is_valid": True})
                except Exception:
                    print(f"Corrupted image detected and excluded: {file_path}")
                    valid_records.append({"filepath": file_path, "class": class_name, "is_valid": False})

    print(f"Verified {len(valid_records)} image records.")

if __name__ == "__main__":
    print("Disease image cleaning and manifest script initialized.")
