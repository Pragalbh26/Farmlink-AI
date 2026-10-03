"""
ai/rag/eligibility/rules_engine.py

Deterministic eligibility engine (Knowledge 01 S6.4 / docs/rag/source-policy.md).
The LLM explains a result; it never decides one - this module is the ONLY
place an eligibility verdict is computed, and it is plain Python, not a
model call. Four output states only, per source-policy.md: Eligible /
Potentially eligible / Not eligible / Insufficient information.

Rules encode ONLY the real, sourced criteria in data/raw/government_schemes/
(pm-kisan.json, pmfby.json, kcc.json) - nothing here is invented. Where the
real criteria are more nuanced than a yes/no rule can capture (e.g. PMFBY's
per-state notified-crop list, which is not sourced yet), the rule returns
Insufficient information rather than guessing.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class EligibilityStatus(str, Enum):
    ELIGIBLE = "Eligible"
    POTENTIALLY_ELIGIBLE = "Potentially eligible"
    NOT_ELIGIBLE = "Not eligible"
    INSUFFICIENT_INFO = "Insufficient information"


@dataclass
class FarmerProfile:
    owns_cultivable_land: bool | None = None
    is_institutional_landholder: bool | None = None
    is_government_employee_above_group_d: bool | None = None
    monthly_pension_inr: float | None = None
    is_registered_professional: bool | None = None  # doctor/engineer/lawyer/CA/architect in practice
    pays_income_tax: bool | None = None
    holds_constitutional_or_elected_post: bool | None = None


@dataclass
class EligibilityResult:
    scheme_id: str
    status: EligibilityStatus
    reasons: list[str]
    source_url: str


def check_pm_kisan(profile: FarmerProfile) -> EligibilityResult:
    reasons = []
    unknowns = []

    if profile.owns_cultivable_land is None:
        unknowns.append("land ownership not provided")
    elif not profile.owns_cultivable_land:
        return EligibilityResult("pm-kisan", EligibilityStatus.NOT_ELIGIBLE,
                                  ["PM-KISAN requires the farmer family to own cultivable land."],
                                  "https://pmkisan.gov.in")

    exclusion_checks = [
        (profile.is_institutional_landholder, "institutional landholders are excluded"),
        (profile.is_government_employee_above_group_d, "government employees above Group D/Class IV are excluded"),
        (profile.is_registered_professional, "registered professionals in active practice are excluded"),
        (profile.pays_income_tax, "income-tax payers are excluded"),
        (profile.holds_constitutional_or_elected_post, "holders of constitutional/elected posts are excluded"),
    ]
    for flag, reason in exclusion_checks:
        if flag is True:
            return EligibilityResult("pm-kisan", EligibilityStatus.NOT_ELIGIBLE, [reason], "https://pmkisan.gov.in")
        if flag is None:
            unknowns.append(reason.replace("are excluded", "- not confirmed"))

    if profile.monthly_pension_inr is not None and profile.monthly_pension_inr >= 10000:
        return EligibilityResult("pm-kisan", EligibilityStatus.NOT_ELIGIBLE,
                                  ["Pension of Rs 10,000/month or more excludes non-Group-D pensioners."],
                                  "https://pmkisan.gov.in")

    if unknowns:
        return EligibilityResult("pm-kisan", EligibilityStatus.INSUFFICIENT_INFO,
                                  [f"Need to confirm: {u}" for u in unknowns], "https://pmkisan.gov.in")

    return EligibilityResult("pm-kisan", EligibilityStatus.ELIGIBLE,
                              ["Owns cultivable land; none of the exclusion categories apply."],
                              "https://pmkisan.gov.in")


def check_kcc(profile: FarmerProfile) -> EligibilityResult:
    # KCC eligibility (owner-cultivator / tenant / lessee / sharecropper) is broader than PM-KISAN's
    # land-ownership test - a tenant with no land title can still qualify. Land ownership alone is not
    # decisive either way, so this is intentionally NOT reused from check_pm_kisan.
    if profile.owns_cultivable_land is None:
        return EligibilityResult("kcc", EligibilityStatus.INSUFFICIENT_INFO,
                                  ["Need to confirm land ownership or tenancy/lease status - KCC accepts "
                                   "owner-cultivators, tenant farmers, oral lessees, and sharecroppers."],
                                  "https://fasalrin.gov.in")
    return EligibilityResult("kcc", EligibilityStatus.POTENTIALLY_ELIGIBLE,
                              ["Farmers engaged in crop production or allied activities can generally apply "
                               "at a participating bank - final approval and limit are the bank's decision, "
                               "not this engine's."],
                              "https://fasalrin.gov.in")


def check_pmfby(profile: FarmerProfile, crop: str | None = None, state: str | None = None) -> EligibilityResult:
    # Real limitation, not a bug: state-wise notified-crop lists are not sourced yet
    # (data/raw/government_schemes/*_STUB.json). Returning Insufficient information
    # here is the correct, honest behavior - not a rule this engine is allowed to guess.
    return EligibilityResult("pmfby", EligibilityStatus.INSUFFICIENT_INFO,
                              ["PMFBY coverage depends on which crops are notified in your state and season "
                               "- that list is not yet in this system. Check with your bank or the pmfby.gov.in "
                               "portal for your specific crop and district."],
                              "https://pmfby.gov.in")


def check_agriculture_infrastructure_fund(profile: FarmerProfile) -> EligibilityResult:
    # AIF is a LOAN facility (interest subvention + credit guarantee), not income
    # support - eligibility here means "can apply for the facility", not "will be
    # approved for a loan", which the lending bank alone decides.
    if profile.owns_cultivable_land is None:
        return EligibilityResult(
            "agriculture-infrastructure-fund", EligibilityStatus.INSUFFICIENT_INFO,
            ["Need more detail about the proposed project (e.g. warehouse, cold chain, custom hiring "
             "centre) to confirm this is an eligible AIF project category - land ownership alone doesn't "
             "determine AIF eligibility the way it does for PM-KISAN."],
            "https://agriinfra.dac.gov.in",
        )
    return EligibilityResult(
        "agriculture-infrastructure-fund", EligibilityStatus.POTENTIALLY_ELIGIBLE,
        ["Farmers, FPOs, cooperatives, SHGs, and agri-entrepreneurs can generally apply for AIF-eligible "
         "post-harvest/community-farming infrastructure projects, subject to a minimum 10% own "
         "contribution to project cost - final loan approval is the lending bank's decision, not this "
         "engine's."],
        "https://agriinfra.dac.gov.in",
    )


def check_ap_annadata_sukhibhava(profile: FarmerProfile, state: str | None = None) -> EligibilityResult:
    # Documented in data/raw/government_schemes/ap-annadata-sukhibhava.json:
    # sources disagree on exact current benefit amount/disbursement status after
    # the 2024-25 YSR Rythu Bharosa -> Annadata Sukhibhava transition. Guessing
    # a specific number here would violate the "never invent scheme facts" rule
    # even though the SCHEME's existence and rough shape are well-corroborated.
    if state and state.strip().lower() not in ("andhra pradesh", "ap"):
        return EligibilityResult(
            "ap-annadata-sukhibhava", EligibilityStatus.NOT_ELIGIBLE,
            ["This is an Andhra Pradesh state scheme - not applicable outside AP."],
            "https://ysrrythubharosa.ap.gov.in",
        )
    return EligibilityResult(
        "ap-annadata-sukhibhava", EligibilityStatus.INSUFFICIENT_INFO,
        ["This scheme was renamed/restructured around 2024-25 (YSR Rythu Bharosa -> Annadata Sukhibhava) "
         "and current sources disagree on the exact benefit amount and disbursement schedule - confirm "
         "directly on the official AP portal before relying on any specific figure."],
        "https://ysrrythubharosa.ap.gov.in",
    )


ENGINE = {
    "pm-kisan": check_pm_kisan,
    "kcc": check_kcc,
    "pmfby": check_pmfby,
    "agriculture-infrastructure-fund": check_agriculture_infrastructure_fund,
    "ap-annadata-sukhibhava": check_ap_annadata_sukhibhava,
}
