"""
ai/common/validation.py
Schema + sanity validation for mandi price data.
Field names match the CONFIRMED live data.gov.in schema exactly:
state, district, market, commodity, variety, grade, arrival_date,
min_price, max_price, modal_price.
"""
from dataclasses import dataclass, field
import pandas as pd

REQUIRED_MANDI_COLUMNS = [
    "state", "district", "market", "commodity", "variety", "grade",
    "arrival_date", "min_price", "max_price", "modal_price",
]


@dataclass
class ValidationResult:
    ok: bool
    issues: list = field(default_factory=list)

    def report(self) -> str:
        if self.ok:
            return "VALID - no schema issues found."
        return "INVALID -\n" + "\n".join(f"  - {i}" for i in self.issues)


def validate_mandi_schema(df: pd.DataFrame) -> ValidationResult:
    """Leakage-safe-pipeline rule checks per docs/price/target-and-leakage.md.
    Never silently accepts a missing-price-as-zero row (rule 4)."""
    issues = []

    missing_cols = [c for c in REQUIRED_MANDI_COLUMNS if c not in df.columns]
    if missing_cols:
        issues.append(f"Missing columns: {missing_cols}")
        return ValidationResult(ok=False, issues=issues)

    d = df.copy()
    for c in ["min_price", "max_price", "modal_price"]:
        d[c] = pd.to_numeric(d[c], errors="coerce")

    zero_or_neg = d[(d["modal_price"] <= 0) | (d["min_price"] <= 0) | (d["max_price"] <= 0)]
    if len(zero_or_neg):
        issues.append(
            f"{len(zero_or_neg)} row(s) with a price <= 0 "
            f"(rule: missing price must be NaN, never silently 0)"
        )

    bad_order = d[(d["min_price"] > d["modal_price"]) | (d["modal_price"] > d["max_price"])]
    if len(bad_order):
        issues.append(f"{len(bad_order)} row(s) violate min_price <= modal_price <= max_price")

    dup_cols = [c for c in ["state", "market", "commodity", "variety", "arrival_date"] if c in df.columns]
    dup = df.duplicated(subset=dup_cols)
    if dup.sum():
        issues.append(f"{int(dup.sum())} duplicate row(s) on {dup_cols}")

    return ValidationResult(ok=(len(issues) == 0), issues=issues)
