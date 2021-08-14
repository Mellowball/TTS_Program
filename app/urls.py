from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('board/<int:tnum>/', views.board, name='board'),
    
    
    path('home_others/<str:countrylang>/', views.home_others, name='home_others'),
    path('board_others/<str:countrylang>/<int:tnum>/', views.board_others, name='board_others'),


    path('admin/', views.admin_home, name='admin_home'),
    path('admin/create/', views.admin_create, name='admin_create'),
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/logout/', views.admin_logout, name='admin_logout'),
    path('admin/fix/<int:tnum>/', views.admin_fix, name='admin_fix'),
]