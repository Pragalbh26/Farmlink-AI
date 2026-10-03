"""
scripts/check_environment.py
Run after conda setup to confirm the agriconnect environment is ready.
Usage:
    conda activate agriconnect
    python scripts/check_environment.py
"""
import importlib
import sys

REQUIRED_NOW = [
    ("numpy", "numpy"), ("pandas", "pandas"), ("sklearn", "scikit-learn"),
    ("matplotlib", "matplotlib"), ("seaborn", "seaborn"), ("jupyterlab", "jupyterlab"),
    ("requests", "requests"), ("dotenv", "python-dotenv"), ("yaml", "PyYAML"),
    ("openpyxl", "openpyxl"), ("pytest", "pytest"),
]


def main() -> None:
    print(f"Python: {sys.version}\n")
    ok = True
    for import_name, package_name in REQUIRED_NOW:
        try:
            mod = importlib.import_module(import_name)
            version = getattr(mod, "__version__", "unknown")
            print(f"  [OK]      {package_name:<16} {version}")
        except ImportError as e:
            ok = False
            print(f"  [MISSING] {package_name:<16} -> {e}")
    print("\nAll REQUIRED-NOW packages OK." if ok
          else "\nSome packages missing -> pip install -r requirements/required-now.txt")


if __name__ == "__main__":
    main()
