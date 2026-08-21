import pytest
import pandas as pd
import numpy as np

def test_price_cleaning_preserves_nan():
    """Verify that missing or non-positive prices are set to NaN and not 0."""
    raw_data = pd.DataFrame({
        'market': ['Lasalgaon', 'Khanna'],
        'modal_price': [0, -100]
    })
    
    # Cleaning rule verification
    raw_data.loc[raw_data['modal_price'] <= 0, 'modal_price'] = np.nan
    
    assert pd.isna(raw_data.loc[0, 'modal_price']), "Zero price was not converted to NaN"
    assert pd.isna(raw_data.loc[1, 'modal_price']), "Negative price was not converted to NaN"

def test_duplicate_removal():
    """Verify duplicate market records are dropped."""
    raw_data = pd.DataFrame({
        'market': ['Lasalgaon', 'Lasalgaon'],
        'arrival_date': ['2026-08-20', '2026-08-20']
    })
    cleaned = raw_data.drop_duplicates()
    assert len(cleaned) == 1, "Duplicate records were not removed"
