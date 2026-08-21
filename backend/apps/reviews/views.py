from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg

from .models import Review
from .serializers import ReviewSerializer
from apps.users.models import User
from apps.common.utils import send_realtime_notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review_view(request):
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        # Save the review and link it to the logged-in user
        review = serializer.save(reviewer=request.user)
        
        # Notify the person who just received the review
        try:
            reviewee_id = str(review.reviewee.id)
            reviewer_name = request.user.name or "A user"
            send_realtime_notification(
                user_id=reviewee_id,
                message_text=f"{reviewer_name} just left you a {review.rating}-star review!",
                alert_type="new_review"
            )
        except AttributeError:
            pass

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews_view(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"success": False, "error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    reviews = Review.objects.filter(reviewee=user).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0

    return Response({
        "success": True, 
        "data": {
            "average_rating": round(avg_rating, 1),
            "total_reviews": reviews.count(),
            "reviews": serializer.data
        }
    }, status=status.HTTP_200_OK)