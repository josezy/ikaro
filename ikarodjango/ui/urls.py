from django.urls import path

from ui.views.pages import Home, FlightPanel


urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('panel', FlightPanel.as_view(), name='flight_panel'),
]
