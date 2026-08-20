from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import CropListing
from .serializers import CropListingSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def listing_list_create_view(request):
    if request.method == 'GET':
        # Optional: Allow anyone to view active listings, or just authenticated users
        listings = CropListing.objects.filter(status='active').order_by('-created_at')
        serializer = CropListingSerializer(listings, many=True)
        return Response({
            "success": True, 
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Only allow farmers to create listings
        if request.user.role != 'farmer':
            return Response({
                "success": False, 
                "error": "Only farmers can create listings."
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = CropListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True, 
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "success": False, 
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listing_detail_view(request, pk):
    try:
        listing = CropListing.objects.get(pk=pk)
    except CropListing.DoesNotExist:
        return Response({
            "success": False, 
            "error": "Listing not found."
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = CropListingSerializer(listing)
    return Response({
        "success": True, 
        "data": serializer.data
    }, status=status.HTTP_200_OK)