from django.urls import path
from .views import (
    PricePredictView,
    DiseasePredictView,
    SchemesListView,
    SchemeEligibilityView,
    ChatView,
)

urlpatterns = [
    path("prices/predict", PricePredictView.as_view(), name="price-predict"),
    path("disease/predict", DiseasePredictView.as_view(), name="disease-predict"),
    path("schemes", SchemesListView.as_view(), name="schemes-list"),
    path("schemes/eligibility", SchemeEligibilityView.as_view(), name="schemes-eligibility"),
    path("chat/", ChatView.as_view(), name="ai-chat"),
]