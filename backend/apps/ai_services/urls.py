from django.urls import path
from .views import (
    price_predict_view, 
    disease_predict_view, 
    chat_view, 
    schemes_list_view, 
    schemes_eligibility_view
)

urlpatterns = [
    path('prices/predict', price_predict_view, name='price-predict'),
    path('disease/predict', disease_predict_view, name='disease-predict'),
    path('chat', chat_view, name='chat'),
    path('schemes', schemes_list_view, name='schemes-list'),
    path('schemes/eligibility', schemes_eligibility_view, name='schemes-eligibility'),
]