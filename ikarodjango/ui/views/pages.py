from django.conf import settings

from ui.views.base_views import BaseView, PublicReactView
from ikaro.utils import require_login


class Looby(BaseView):
    title = "Looby"
    template = 'ui/home.html'


class FlightPanel(PublicReactView):
    title = "Live Flight"
    template = "ui/panel.html"
    component = 'pages/flight_panel.js'

    @require_login
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def props(self, request, *args, **kwargs):
        return {
            'map_key': settings.MAP_KEY
        }
