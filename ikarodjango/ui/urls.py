from django.urls import path

from ui.views.pages import Home, FlightPanel

urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('flight', FlightPanel.as_view(), name='flight_panel'),
]
