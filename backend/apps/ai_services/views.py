from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def price_predict_view(request):
    # Mock response for Member 1's price inference wrapper
    crop = request.data.get('crop', 'Unknown')
    return Response({
        "success": True,
        "data": {
            "crop": crop,
            "forecast_date": datetime.now().isoformat(),
            "predicted_price": 32.50,
            "interval_min": 30.00,
            "interval_max": 35.00
        },
        "meta": {"model_version": "mock-v1.0"}
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disease_predict_view(request):
    # Mock response for image inference
    return Response({
        "success": True,
        "data": {
            "predicted_class": "Early Blight",
            "confidence": 0.92,
            "treatment_suggestion": "Apply copper-based fungicide."
        },
        "meta": {"model_version": "mock-vision-v1.0"}
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    # Mock response for RAG chatbot
    query = request.data.get('message', '')
    return Response({
        "success": True,
        "data": {
            "role": "assistant",
            "message": "Yes, you are eligible for the PM-KISAN scheme based on your profile.",
            "citations": ["PM-KISAN Guidelines Sec 2.1"]
        },
        "meta": {"session_id": "mock-session-123"}
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schemes_list_view(request):
    # Mock response for scheme discovery
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
