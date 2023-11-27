from django.urls import re_path
from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from pong_backend_app import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/?$', consumers.GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    # Handle HTTP requests through Django's ASGI application
    "http": get_asgi_application(),
    # Handle WebSocket requests through Channels' URLRouter
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
