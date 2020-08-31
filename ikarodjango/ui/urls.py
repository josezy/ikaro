from django.urls import path, include
from django.http import HttpResponse

from panel.views import FlightPanel
from ui.views.pages import Looby
from ui.views.accounts import Login, Logout, Signup


urlpatterns = [
    path('', Looby.as_view(), name='home'),

    path('accounts/login/', Login.as_view(), name='login'),
    path('accounts/signup/', lambda r: HttpResponse(
        "Error", content_type="text/plain"), name='signup'),
    path('genesis/', Signup.as_view()),
    path('accounts/logout/', Logout.as_view(), name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),

    path('flight/<str:id>', FlightPanel.as_view(), name='flight_room'),
]
