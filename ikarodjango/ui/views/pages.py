from panel.models import Room
from ui.views.base_views import BaseView


class Looby(BaseView):
    title = "Looby"
    template = 'ui/home.html'

    def context(self, request):
        if not request.user.is_authenticated:
            return {}

        return {
            "rooms": [{
                "short_id": room.short_id,
                "name": room.name or f"Room #{room.short_id}"
            } for room in Room.objects.filter(host=request.user)]
        }
