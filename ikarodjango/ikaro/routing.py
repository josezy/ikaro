from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from panel.consumers import PanelConsumer, VideoConsumer

application = ProtocolTypeRouter({
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                path("mavlink/<str:room_id>", PanelConsumer()),  # from users
                path("mavlink", PanelConsumer()),  # from drones /mavlink?plate=x
                path("video", VideoConsumer()),
            ])
        )
    )
})
