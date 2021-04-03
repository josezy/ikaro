from django.conf import settings
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse
from django.http import HttpResponseNotFound

from ikaro.utils import require_login
from ui.views.base_views import PublicReactView

from panel.models import Room


class FlightPanel(PublicReactView):
    title = "Live Flight"
    template = "ui/panel.html"
    component = "pages/flight_panel.js"

    def get(self, request, *args, **kwargs):
        room = get_object_or_404(
            Room.objects, id__startswith=kwargs.get("id", None)
        )

        kwargs = {"id": room.short_id}
        shortid_path = reverse("flight_room", kwargs=kwargs)
        if request.path != shortid_path:
            return redirect("flight_room", **kwargs)

        return super().get(request, *args, **kwargs)

    def props(self, request, *args, **kwargs):
        room = Room.objects.get(id__startswith=kwargs.get("id", None))

        return {
            "map_key": settings.MAP_KEY,
            "is_owner": room.drone.owner == request.user
        }
