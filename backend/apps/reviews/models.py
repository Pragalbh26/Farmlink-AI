import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.orders.models import Order

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # The person writing the review
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    # The person receiving the review
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    # The order this review is linked to
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, related_name='reviews')
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent a user from reviewing the same order twice
        unique_together = ('reviewer', 'order')

    def __str__(self):
        return f"{self.reviewer.name} -> {self.reviewee.name} ({self.rating} Stars)"