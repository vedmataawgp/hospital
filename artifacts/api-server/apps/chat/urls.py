from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.list_conversations, name='chat-conversations'),
    path('conversations/start/', views.start_conversation, name='chat-start'),
    path('conversations/<int:convo_id>/messages/', views.conversation_messages, name='chat-messages'),
    path('conversations/<int:convo_id>/send/', views.send_message, name='chat-send'),
    path('conversations/<int:convo_id>/mark-read/', views.mark_read, name='chat-mark-read'),
    path('conversations/<int:convo_id>/typing/', views.typing_status, name='chat-typing'),
    path('users/search/', views.search_users, name='chat-search-users'),
    path('appointment-contacts/', views.appointment_contacts, name='chat-appointment-contacts'),
]
