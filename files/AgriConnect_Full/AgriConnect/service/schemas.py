"""
service/schemas.py
Pydantic request/response models matching the confirmed API contract
(Knowledge 02 S5, Knowledge 09, docs/handoffs/batch1_team_notes.md).
Standard envelope on every endpoint: success, data, error, meta.
"""
from typing import Any, Optional
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str


class Meta(BaseModel):
    model_version: Optional[str] = None
    is_synthetic_model: Optional[bool] = None


class Envelope(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[ErrorDetail] = None
    meta: Meta = Meta()


class PricePredictRequest(BaseModel):
    state: str
    market: str
    commodity: str
    horizon_days: int = 1


class DiseasePredictRequest(BaseModel):
    image_path: str  # Member 2 will change this to an UploadFile in the real backend integration


class ChatRequest(BaseModel):
    query: str


class EligibilityRequest(BaseModel):
    scheme_id: str
    owns_cultivable_land: Optional[bool] = None
    is_institutional_landholder: Optional[bool] = None
    is_government_employee_above_group_d: Optional[bool] = None
    monthly_pension_inr: Optional[float] = None
    is_registered_professional: Optional[bool] = None
    pays_income_tax: Optional[bool] = None
    holds_constitutional_or_elected_post: Optional[bool] = None
