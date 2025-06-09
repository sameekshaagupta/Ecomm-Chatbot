from django.urls import path
from .views import (
    chat_message, chat_sessions, chat_session_detail,
    reset_chat_session, delete_chat_session, product_details_for_chat
)

urlpatterns = [
    path('message/', chat_message, name='chat-message'),
    path('sessions/', chat_sessions, name='chat-sessions'),
    path('sessions/<str:session_id>/', chat_session_detail, name='chat-session-detail'),
    path('sessions/<str:session_id>/reset/', reset_chat_session, name='reset-chat-session'),
    path('sessions/<str:session_id>/delete/', delete_chat_session, name='delete-chat-session'),
    path('product/<int:product_id>/', product_details_for_chat, name='product-details-chat'),
]