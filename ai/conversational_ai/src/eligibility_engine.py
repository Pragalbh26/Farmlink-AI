import json
from typing import Dict, List, Any

def check_scheme_eligibility(user_profile: Dict[str, Any], schemes_db_path: str) -> List[Dict[str, Any]]:
    """
    Evaluates a farmer profile against the structured scheme database criteria.
    """
    with open(schemes_db_path, 'r') as f:
        schemes = json.load(f)
        
    eligible_schemes = []
    land_ha = user_profile.get("land_holding_ha", 0.0)
    occupation = user_profile.get("occupation", "Farmer")
    
    for scheme in schemes:
        criteria = scheme.get("eligibility_criteria", {})
        min_land = criteria.get("min_land_holding_ha", 0.0)
        max_land = criteria.get("max_land_holding_ha", 100.0)
        allowed_occupations = criteria.get("allowed_occupations", ["ALL"])
        
        # Rule evaluation logic
        land_eligible = min_land <= land_ha <= max_land
        occupation_eligible = "ALL" in allowed_occupations or occupation in allowed_occupations
        
        if land_eligible and occupation_eligible:
            eligible_schemes.append({
                "scheme_id": scheme["scheme_id"],
                "scheme_name": scheme["scheme_name"],
                "financial_benefit": scheme["financial_benefit"],
                "official_url": scheme["official_url"]
            })
            
    return eligible_schemes

if __name__ == "__main__":
    sample_farmer = {"land_holding_ha": 1.5, "occupation": "Farmer"}
    print("Eligibility engine initialized.")
