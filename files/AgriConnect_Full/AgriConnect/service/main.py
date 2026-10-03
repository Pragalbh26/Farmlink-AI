"""
service/main.py
AI microservice - Knowledge 02 S2/S5 endpoints. This is what Member 2's
backend calls internally. Every response uses the same Envelope shape.

Run: uvicorn service.main:app --reload   (from the AgriConnect/ root)
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from service.schemas import (
    Envelope, ErrorDetail, Meta,
    PricePredictRequest, DiseasePredictRequest, ChatRequest, EligibilityRequest,
)
from ai.price_prediction.src.ingest import generate_synthetic_fixture
from ai.price_prediction.src.inference import PricePredictor
from ai.disease_detection.src.inference import DiseasePredictor
from ai.rag.src.vector_store import FaissStore
from ai.rag.src.rag_pipeline import answer_general_question
from ai.rag.eligibility.rules_engine import ENGINE, FarmerProfile
from ai.common.config import PROJECT_ROOT

_price_predictor = None
_disease_predictor = None
_rag_store = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _price_predictor, _disease_predictor, _rag_store
    try:
        _price_predictor = PricePredictor.load_latest()
    except FileNotFoundError:
        _price_predictor = None
    try:
        _disease_predictor = DiseasePredictor.load_latest()
    except FileNotFoundError:
        _disease_predictor = None
    try:
        _rag_store = FaissStore.load(PROJECT_ROOT / "ai/rag/models/scheme_index_v1")
    except Exception:
        _rag_store = None
    yield


app = FastAPI(title="AgriConnect AI Service", version="0.1.0-batch9", lifespan=lifespan)


@app.get("/health")
def health():
    return {
        "price_model_loaded": _price_predictor is not None,
        "disease_model_loaded": _disease_predictor is not None,
        "rag_index_loaded": _rag_store is not None,
    }


@app.post("/api/v1/prices/predict", response_model=Envelope)
def predict_price(req: PricePredictRequest):
    if _price_predictor is None:
        return Envelope(success=False, error=ErrorDetail(code="MODEL_NOT_LOADED", message="Run price notebooks 01-04 first."))
    # demo: pulls history from the synthetic fixture, filtered to the requested series.
    # Member 2's real integration queries data/processed or the price_observations DB table instead.
    df = generate_synthetic_fixture(n_rows=100000, seed=42)
    series = df[(df.state == req.state) & (df.market == req.market) & (df.commodity == req.commodity)]
    if series.empty:
        return Envelope(success=False, error=ErrorDetail(code="SERIES_NOT_FOUND", message=f"No history for {req.state}/{req.market}/{req.commodity} in the current dataset."))
    result = _price_predictor.predict(series, horizon_days=req.horizon_days)
    return Envelope(success=True, data=result.to_dict(),
                     meta=Meta(model_version=result.model_version, is_synthetic_model=result.is_synthetic_model))


@app.post("/api/v1/disease/predict", response_model=Envelope)
def predict_disease(req: DiseasePredictRequest):
    if _disease_predictor is None:
        return Envelope(success=False, error=ErrorDetail(code="MODEL_NOT_LOADED", message="Run disease notebooks 01-03 first."))
    path = Path(req.image_path)
    if not path.exists():
        return Envelope(success=False, error=ErrorDetail(code="IMAGE_NOT_FOUND", message=str(path)))
    result = _disease_predictor.predict(path)
    return Envelope(success=True, data=result.to_dict(), meta=Meta(model_version=result.model_version))


@app.post("/api/v1/chat", response_model=Envelope)
def chat(req: ChatRequest):
    if _rag_store is None:
        return Envelope(success=False, error=ErrorDetail(code="INDEX_NOT_LOADED", message="Run RAG notebook 01 first."))
    response = answer_general_question(_rag_store, req.query)
    return Envelope(success=(not response.abstained), data=response.to_dict(), meta=Meta(model_version=response.model_version))


@app.post("/api/v1/schemes/eligibility", response_model=Envelope)
def check_eligibility(req: EligibilityRequest):
    if req.scheme_id not in ENGINE:
        return Envelope(success=False, error=ErrorDetail(code="UNKNOWN_SCHEME", message=f"'{req.scheme_id}' not in {list(ENGINE.keys())}"))
    profile = FarmerProfile(**{k: v for k, v in req.model_dump().items() if k != "scheme_id"})
    result = ENGINE[req.scheme_id](profile)
    return Envelope(success=True, data={"scheme_id": result.scheme_id, "status": result.status.value,
                                          "reasons": result.reasons, "source_url": result.source_url})
