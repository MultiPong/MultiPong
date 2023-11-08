from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register_account/', views.register_account),
    path('edit_account/', views.edit_account),
    path('get_account_info/', views.get_account_info),
    path('user_match_history/', views.user_match_history),
    path('create_game_room/', views.create_game_room),
    path('match_stats/', views.match_stats),
    path('save_match_stats/', views.save_match_stats),
]
