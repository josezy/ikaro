from django.conf import settings
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse

from ui.views.base_views import PublicReactView, APIView

from panel.models import Room
from panel.utils import is_pilot


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
        room_id = kwargs.get("id", None)
        assert room_id is not None, "No room ID provided"
        room = Room.objects.get(id__startswith=room_id)

        return {
            "map_key": settings.MAP_KEY,
            "is_pilot": is_pilot(room.short_id, request.user.id),
            "videoroom_id": room.videoroom_id,
        }


class Spectators(APIView):
    def get(self, request, *args, **kwargs):
        room = get_object_or_404(
            Room.objects, id__startswith=kwargs.get("id", None)
        )
        return self.respond({
            "total": room.total_viewers,
        })
