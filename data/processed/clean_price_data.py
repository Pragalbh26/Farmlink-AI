import pandas as pd
import numpy as np

def clean_mandi_prices(input_path: str, output_path: str) -> pd.DataFrame:
    """
    Cleans raw AGMARKNET mandi price data without zero-inflating missing values.
    """
    # Load raw dataset
    df = pd.read_csv(input_path)
    
    # 1. Standardize string columns
    string_cols = ['state', 'district', 'market', 'commodity', 'variety']
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.title()
            
    # 2. Convert dates to standard ISO format (YYYY-MM-DD)
    if 'arrival_date' in df.columns:
        df['arrival_date'] = pd.to_datetime(df['arrival_date'], errors='coerce')
        
    # 3. Handle numeric price bounds and explicitly preserve missing values (no zero replacement)
    price_cols = ['min_price', 'max_price', 'modal_price']
    for col in price_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            # Set negative or unrealistic prices to NaN
            df.loc[df[col] <= 0, col] = np.nan

    # 4. Remove duplicate market-date records
    subset_cols = ['market', 'commodity', 'variety', 'arrival_date']
    valid_subsets = [c for c in subset_cols if c in df.columns]
    df = df.drop_duplicates(subset=valid_subsets, keep='last')
    
    # Save processed dataset snapshot
    df.to_parquet(output_path, index=False) if output_path.endswith('.parquet') else df.to_csv(output_path, index=False)
    print(f"Cleaned dataset saved successfully to {output_path}. Total records: {len(df)}")
    return df

if __name__ == "__main__":
    print("Mandi price cleaner script initialized.")
