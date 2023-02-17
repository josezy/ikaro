from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from panel.consumers import MavlinkConsumer

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                path("mavlink/<str:type>/<str:id>", MavlinkConsumer.as_asgi()),
            ])
        )
    )
})
