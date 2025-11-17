from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.task_list, name='task-list'),
    path('tasks/<int:pk>/', views.task_detail, name='task-detail'),
    path('stages/', views.stage_list, name='stage-list'),
    path('stages/<int:pk>/', views.stage_detail, name='stage-detail'),
    path('stages/<int:pk>/delete/', views.stage_delete, name='stage-delete'),
]