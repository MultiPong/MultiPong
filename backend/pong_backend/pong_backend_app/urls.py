from django.urls import path, include, re_path
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
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),

    path('register/', views.RegisterView.as_view(), name='register'),
    path('edit_profile/', views.EditProfileView.as_view(), name='edit_profile'),
    path('get_account_info/', views.get_account_info),

    path('user_match_history/', views.MatchHistoryView.as_view(), name='user_match_history'),
    path('match_stats/', views.match_stats),
    path('save_match_stats/', views.save_match_stats),

    path('create_game_room/', views.create_game_room),

]
