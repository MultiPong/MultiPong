from django.apps import AppConfig


class PongBackendAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pong_backend_app"

    def ready(self):
        import pong_backend_app.signals
