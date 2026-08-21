from django.urls import path
from .views import create_review_view, user_reviews_view

urlpatterns = [
    path('', create_review_view, name='create-review'),
    path('user/<uuid:user_id>', user_reviews_view, name='user-reviews'),
]