from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.list_conversations, name='chat-conversations'),
    path('conversations/start/', views.start_conversation, name='chat-start'),
    path('conversations/<int:convo_id>/messages/', views.conversation_messages, name='chat-messages'),
    path('conversations/<int:convo_id>/send/', views.send_message, name='chat-send'),
    path('users/search/', views.search_users, name='chat-search-users'),
]
