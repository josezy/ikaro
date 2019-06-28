from ui.views.base_views import BaseView, PublicReactView


class Home(BaseView):
    title = "Home"
    template = 'ui/home.html'


class FlightPanel(PublicReactView):
    title = "Live Flight"
    component = 'pages/flight_panel.js'
