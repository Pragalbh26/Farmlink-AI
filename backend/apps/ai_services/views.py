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
    # Mock response for eligibility evaluation
    return Response({
        "success": True,
        "data": {
            "scheme_id": request.data.get('scheme_id', 1),
            "status": "Eligible",
            "explanation": "Profile matches all deterministic rules for land ownership."
        }
    }, status=status.HTTP_200_OK)