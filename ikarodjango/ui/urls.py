from django.urls import path

from ui.views.pages import Looby, FlightPanel


urlpatterns = [
    path('', Looby.as_view(), name='home'),
    path('panel', FlightPanel.as_view(), name='flight_panel'),
]
