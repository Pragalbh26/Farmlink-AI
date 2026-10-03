"""tests/ai/rag/test_rules_engine.py"""
from ai.rag.eligibility.rules_engine import (
    check_pm_kisan, check_kcc, check_pmfby, check_agriculture_infrastructure_fund,
    check_ap_annadata_sukhibhava, EligibilityStatus, FarmerProfile, ENGINE,
)

CLEAN_PROFILE = FarmerProfile(
    owns_cultivable_land=True, is_institutional_landholder=False,
    is_government_employee_above_group_d=False, is_registered_professional=False,
    pays_income_tax=False, holds_constitutional_or_elected_post=False,
)


def test_pm_kisan_eligible_for_clean_small_farmer():
    result = check_pm_kisan(CLEAN_PROFILE)
    assert result.status == EligibilityStatus.ELIGIBLE


def test_pm_kisan_excludes_registered_professional():
    profile = FarmerProfile(owns_cultivable_land=True, is_registered_professional=True)
    result = check_pm_kisan(profile)
    assert result.status == EligibilityStatus.NOT_ELIGIBLE


def test_pm_kisan_excludes_income_tax_payer():
    profile = FarmerProfile(owns_cultivable_land=True, is_institutional_landholder=False,
                             is_government_employee_above_group_d=False, is_registered_professional=False,
                             pays_income_tax=True, holds_constitutional_or_elected_post=False)
    assert check_pm_kisan(profile).status == EligibilityStatus.NOT_ELIGIBLE


def test_pm_kisan_excludes_high_pension():
    profile = FarmerProfile(owns_cultivable_land=True, is_institutional_landholder=False,
                             is_government_employee_above_group_d=False, monthly_pension_inr=15000,
                             is_registered_professional=False, pays_income_tax=False,
                             holds_constitutional_or_elected_post=False)
    assert check_pm_kisan(profile).status == EligibilityStatus.NOT_ELIGIBLE


def test_pm_kisan_no_land_is_not_eligible():
    result = check_pm_kisan(FarmerProfile(owns_cultivable_land=False))
    assert result.status == EligibilityStatus.NOT_ELIGIBLE


def test_pm_kisan_missing_fields_is_insufficient_info_not_a_guess():
    result = check_pm_kisan(FarmerProfile(owns_cultivable_land=True))  # everything else unknown
    assert result.status == EligibilityStatus.INSUFFICIENT_INFO


def test_kcc_missing_land_status_is_insufficient_info():
    result = check_kcc(FarmerProfile())
    assert result.status == EligibilityStatus.INSUFFICIENT_INFO


def test_kcc_with_land_info_is_potentially_eligible_not_a_final_yes():
    result = check_kcc(FarmerProfile(owns_cultivable_land=True))
    assert result.status == EligibilityStatus.POTENTIALLY_ELIGIBLE  # bank makes the final call, not this engine


def test_pmfby_always_insufficient_info_pending_state_crop_data():
    result = check_pmfby(CLEAN_PROFILE, crop="Tomato", state="Andhra Pradesh")
    assert result.status == EligibilityStatus.INSUFFICIENT_INFO


def test_aif_is_a_loan_facility_not_income_support():
    result = check_agriculture_infrastructure_fund(CLEAN_PROFILE)
    assert result.status == EligibilityStatus.POTENTIALLY_ELIGIBLE
    assert "bank" in result.reasons[0].lower()  # never claims a guaranteed loan


def test_ap_scheme_outside_ap_is_not_eligible():
    result = check_ap_annadata_sukhibhava(CLEAN_PROFILE, state="Karnataka")
    assert result.status == EligibilityStatus.NOT_ELIGIBLE


def test_ap_scheme_inside_ap_is_insufficient_info_never_a_specific_amount():
    result = check_ap_annadata_sukhibhava(CLEAN_PROFILE, state="Andhra Pradesh")
    assert result.status == EligibilityStatus.INSUFFICIENT_INFO
    # must never assert a specific rupee figure given the documented source disagreement
    assert not any(char.isdigit() for char in " ".join(result.reasons) if char not in "2024-25")


def test_every_scheme_in_engine_returns_a_valid_status_and_real_source_url():
    for scheme_id, fn in ENGINE.items():
        result = fn(CLEAN_PROFILE)
        assert result.status in EligibilityStatus
        assert result.source_url.startswith("https://")
        assert len(result.reasons) > 0
