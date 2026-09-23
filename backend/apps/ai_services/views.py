import os
import joblib
import numpy as np
from datetime import datetime
from PIL import Image

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

try:
    from google import genai
except ImportError:
    genai = None

# ==========================================
# 1. LOAD MODELS INTO MEMORY ON STARTUP
# ==========================================
# Create a folder named 'ml_models' in your main backend directory and put your models there
MODEL_DIR = os.path.join(settings.BASE_DIR, 'ml_models')

# Load Price Model (Scikit-Learn)
try:
    price_model = joblib.load(os.path.join(MODEL_DIR, 'price_model.pkl'))
except Exception:
    price_model = None

# Initialize LLM Client (New Google GenAI SDK standard)
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_api_key.lower().startswith(("your_", "replace-")):
        gemini_api_key = ""
    gemini_client = genai.Client(api_key=gemini_api_key) if genai and gemini_api_key else None
except Exception:
    gemini_client = None

# Load Vision Model (Example using TensorFlow/Keras - adapt if using PyTorch)
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import img_to_array
    disease_model = load_model(os.path.join(MODEL_DIR, 'disease_model.h5'))
    DISEASE_CLASSES = ['Early Blight', 'Healthy', 'Late Blight']
except Exception:
    disease_model = None


# ==========================================
# 2. API ENDPOINTS
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def price_predict_view(request):
    # Mock response for Member 1's price inference wrapper
    crop = request.data.get('commodity') or request.data.get('crop', 'Unknown')
    horizon = request.data.get('horizon', '7day')
    current_price = 32.50
    forecast_price = 34.00 if horizon == '1day' else 35.00
    return Response({
        "success": True,
        "data": {
            "crop": crop,
            "commodity": crop,
            "market": request.data.get('market', 'Unspecified market'),
            "horizon": horizon,
            "forecast_date": datetime.now().isoformat(),
            "forecastPrice": forecast_price,
            "currentModal": current_price,
            "unit": "₹ / Quintal (demo data)",
            "lowerBound": 30.00,
            "upperBound": 35.00,
            "chartData": [],
            "modelMetadata": {"modelVersion": "demo-baseline", "dataFreshness": "Demonstration response; not live mandi data"}
        },
        "meta": {"model_version": "demo-baseline"}
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disease_predict_view(request):
    if not disease_model:
        return Response({"error": "Disease model (disease_model.h5) not found on server."}, status=503)

    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"success": False, "error": "No image uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Preprocess the image for the ML model (Standard 224x224 resize)
        img = Image.open(image_file).convert('RGB')
        img = img.resize((224, 224))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # Run inference
        predictions = disease_model.predict(img_array)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        predicted_class = DISEASE_CLASSES[class_idx]

        return Response({
            "success": True,
            "data": {
                "predicted_class": predicted_class,
                "confidence": round(confidence, 2),
                "treatment_suggestion": "Consult local agronomist." if predicted_class != "Healthy" else "No action needed."
            },
            "meta": {"model_version": "vision-v1.0"}
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    query = request.data.get('message', '')
    if not query:
        return Response({"success": False, "error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not gemini_client:
        demo_answer = (
            "This is a demonstration reply, not verified agricultural advice. "
            "Check with your local agricultural extension office for guidance specific to your crop and area."
        )
        return Response({
            "success": True,
            "data": {
                "role": "assistant",
                "answer": demo_answer,
                "message": demo_answer,
                "sources": [],
                "citations": [],
                "isAbstention": True,
            },
            "meta": {"session_id": "demo-session", "source": "demo-adapter"}
        }, status=status.HTTP_200_OK)

    try:
        # Inject system context so the AI knows it is an agricultural assistant
        prompt = f"You are an agricultural expert AI for Indian farmers. Answer this concisely: {query}"

        # New Google GenAI SDK standard API call
        response = gemini_client.models.generate_content(
            model='gemini-1.5-pro',
            contents=prompt
        )

        return Response({
            "success": True,
            "data": {
                "role": "assistant",
                "answer": response.text,
                "message": response.text,
                "sources": [],
                "citations": [],
                "isAbstention": False,
            },
            "meta": {"session_id": "live-session"}
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schemes_list_view(request):
    return Response({
        "success": True,
        "data": [
            {"id": 1, "scheme_name": "PM-KISAN", "jurisdiction": "Central"},
            {"id": 2, "scheme_name": "PMFBY", "jurisdiction": "Central"}
        ]
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schemes_eligibility_view(request):
    land = float(request.data.get('landHectares', 0) or 0)
    state = request.data.get('state', '')
    excluded = bool(request.data.get('isGovtEmployee') or request.data.get('isTaxPayer'))
    return Response({
        "success": True,
        "data": [
            {"schemeId": "pm-kisan", "schemeName": "PM-KISAN", "status": "not_eligible" if excluded or land <= 0 else "eligible", "reasons": ["Government employees and income-tax payers are excluded." if excluded else "Landholding matches the basic PM-KISAN criteria."], "benefit": "Income support for eligible farmer families", "verifiedAt": "Official guidelines", "sourceUrl": "https://pmkisan.gov.in/"},
            {"schemeId": "pmfby", "schemeName": "PM Fasal Bima Yojana", "status": "potentially_eligible", "reasons": ["Final eligibility depends on notified crops, season and enrollment dates."], "benefit": "Crop insurance protection", "verifiedAt": "Official guidelines", "sourceUrl": "https://pmfby.gov.in/"},
            {"schemeId": "state-support", "schemeName": f"{state or 'State'} Farmer Support", "status": "potentially_eligible", "reasons": ["Check your state agriculture department for current applications."], "benefit": "State agricultural support", "verifiedAt": "State agriculture department", "sourceUrl": "https://www.myscheme.gov.in/"}
        ]
    }, status=status.HTTP_200_OK)
