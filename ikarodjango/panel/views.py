from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponseNotFound

from ikaro.utils import require_login
from ui.views.base_views import PublicReactView

from panel.models import Room


class FlightPanel(PublicReactView):
    title = "Live Flight"
    template = "ui/panel.html"
    component = "pages/flight_panel.js"

    @require_login
    def get(self, request, *args, **kwargs):
        id = kwargs.get("id", None)
        room_qs = Room.objects.filter(id__startswith=id)
        if room_qs.count() != 1:
            return HttpResponseNotFound()

        room = room_qs.get()
        kwargs = {"id": room.short_id}
        shortid_path = reverse("flight_room", kwargs=kwargs)
        if request.path != shortid_path:
            return redirect("flight_room", **kwargs)

        return super().get(request, *args, **kwargs)

    def props(self, request, *args, **kwargs):
        return {
            "map_key": settings.MAP_KEY
        }
