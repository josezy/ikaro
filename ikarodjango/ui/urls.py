from django.urls import path, include
from django.http import HttpResponse

from panel.models import Room
from panel.views import FlightPanel, Spectators
from ui.views.pages import Looby
from ui.views.accounts import Login, Logout, Signup


def reset_viewers_count():
    for room in Room.objects.all():
        room.total_viewers = 0
        room.save()

# reset_viewers_count()

urlpatterns = [
    path('', Looby.as_view(), name='home'),

    path('accounts/login/', Login.as_view(), name='login'),
    path('accounts/signup/', lambda r: HttpResponse(
        "Error", content_type="text/plain"), name='signup'),
    path('genesis/', Signup.as_view()),
    path('accounts/logout/', Logout.as_view(), name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),

    path('flight/<str:id>', FlightPanel.as_view(), name='flight_room'),
    path('spectators/<str:id>', Spectators.as_view()),
]
