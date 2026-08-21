# AGMARKNET Price Data Dictionary

This data dictionary defines the raw and processed schema for wholesale daily mandi prices.

| Column Name | Data Type | Description | Example / Allowed Values | Handling Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `state` | String | State where market is located | "Maharashtra", "Punjab" | Standardize case and strip whitespace |
| `district` | String | District of the market | "Nashik", "Ludhiana" | Standardize naming conventions |
| `market` | String | Name of the mandi/market | "Lasalgaon", "Khanna" | Map aliases to primary market name |
| `commodity` | String | Crop/agricultural produce | "Onion", "Wheat", "Tomato" | Map local names to standard english names |
| `variety` | String | Specific variety of crop | "Local", "Hybrid", "Red" | Group rare varieties into "Other" |
| `arrival_date` | Date (YYYY-MM-DD) | Date of price reporting | "2026-08-20" | Enforce ISO format; sort chronologically |
| `min_price` | Float / Int | Minimum price (₹/Quintal) | 1800.0 | Retain missing as NaN; remove negative values |
| `max_price` | Float / Int | Maximum price (₹/Quintal) | 2400.0 | Retain missing as NaN; check max >= min |
| `modal_price` | Float / Int | Most frequent price (₹/Quintal) | 2100.0 | Primary forecasting target variable |

## Data Quality Rules & Constraints
1. **No Zero Inflation:** Missing prices must remain as `NaN`/`null` and must **never** be replaced with 0.
2. **Logical Price Bounds:** `min_price` <= `modal_price` <= `max_price`.
3. **Duplicates:** Rows with identical `(market, commodity, variety, arrival_date)` are flagged as duplicates.
