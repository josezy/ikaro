from django.conf import settings

from ui.views.base_views import PublicReactView


class FlightPanel(PublicReactView):
    title = "Live Flight"
    component = 'pages/flight_panel.js'

    def props(self, request, *args, **kwargs):
        return {
            'map_key': settings.MAP_KEY
        }
