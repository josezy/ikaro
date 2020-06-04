from django.urls import path, include

from ui.views.pages import Looby, FlightPanel
from ui.views.accounts import Login, Logout, Signup


urlpatterns = [
    path('', Looby.as_view(), name='home'),

    path('accounts/login/', Login.as_view(), name='login'),
    path('accounts/signup/', lambda r: 'Error', name='signup'),
    path('genesis/', Signup.as_view()),
    path('accounts/logout/', Logout.as_view(), name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),

    path('panel', FlightPanel.as_view(), name='flight_panel'),
]
