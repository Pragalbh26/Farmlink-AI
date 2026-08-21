# AgriConnect - Dataset Registry

This registry serves as the single source of truth for all external datasets used across AgriConnect modules.

| Dataset ID | Source / Provider | Purpose | Refresh Schedule | Ownership |
| :--- | :--- | :--- | :--- | :--- |
| **MANDI_DAILY** | data.gov.in / AGMARKNET | Daily wholesale mandi price forecasting | Daily / As source updates | Member 4 |
| **MANDI_VARIETY** | data.gov.in | Variety-level price and market analysis | Periodic / As available | Member 4 |
| **DISEASE_IMAGES** | PlantVillage + Local Field Subset | Crop disease computer vision classification | Versioned snapshot | Member 4 |
| **SCHEME_KB** | myScheme / Official Govt Portals | Government scheme information & RAG corpus | Manual verification per document | Member 4 |
| **WEATHER** | IMD / Open-Meteo API | Weather alerts and localized forecasts | Real-time / API dependent | Member 4 |

## Storage Rules
1. Raw datasets are stored locally in `data/raw/` and never committed directly to Git.
2. Cleaned and processed dataset versions are saved under `data/processed/` with explicit version numbers.
