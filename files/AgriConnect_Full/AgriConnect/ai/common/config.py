"""
ai/common/config.py
Central configuration: paths + secrets (via .env) + shared constants.
Matches Knowledge 02 S3 top-level layout: data/{raw,processed,metadata}.
"""
from pathlib import Path
from dotenv import load_dotenv
import os

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

DATA_DIR = PROJECT_ROOT / "data"
DATA_RAW_DIR = DATA_DIR / "raw"
DATA_PROCESSED_DIR = DATA_DIR / "processed"
DATA_METADATA_DIR = DATA_DIR / "metadata"

for d in (DATA_RAW_DIR, DATA_PROCESSED_DIR, DATA_METADATA_DIR):
    d.mkdir(parents=True, exist_ok=True)

# --- Secrets / API keys: set these in .env (never commit .env) ---
DATA_GOV_IN_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# --- data.gov.in resource id -----------------------------------------------
# Confirmed LIVE on 12 Aug 2026 (real fetch, 10-row public sample-key response):
#   https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
#   Fields confirmed: state, district, market, commodity, variety, grade,
#   arrival_date, min_price, max_price, modal_price
MANDI_RESOURCE_ID = os.getenv("MANDI_RESOURCE_ID", "9ef84268-d588-465a-a308-a864a43d0070")

# The public "sample key" data.gov.in itself publishes for testing on the
# resource's own documentation page. Hard-capped at 10 records/call by the
# provider - fine for schema checks, NOT a substitute for a real registered
# key (Category C user action - see PROGRESS_LEDGER.md).
DATA_GOV_IN_SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"

# --- Reproducibility --------------------------------------------------------
RANDOM_SEED = 42
