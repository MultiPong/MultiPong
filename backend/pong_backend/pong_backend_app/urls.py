from django.urls import path, include
from . import views

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions


schema_view = get_schema_view(
    openapi.Info(
        title="Multipong API",
        default_version='v.01',
        description="API for Multipong",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('register_account/', views.register_account),
    path('edit_account/', views.edit_account),
    path('get_account_info/', views.get_account_info),
    path('user_match_history/<uuid:user_id>/', views.user_match_history, name='user_match_history'),
    path('create_game_room/', views.create_game_room),
    path('match_stats/', views.match_stats),
    path('save_match_stats/', views.save_match_stats),
    path('login/', views.LoginView.as_view(), name='login'),
]
