from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Session {self.session_id} - {self.user.username}"

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('user', 'User'),
        ('bot', 'Bot'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

class UserIntent(models.Model):
    """Track user intents for better chatbot responses"""
    INTENT_TYPES = [
        ('search', 'Product Search'),
        ('filter', 'Filter Products'),
        ('details', 'Product Details'),
        ('compare', 'Product Comparison'),
        ('recommendation', 'Product Recommendation'),
        ('greeting', 'Greeting'),
        ('help', 'Help Request'),
        ('other', 'Other'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='intents')
    intent_type = models.CharField(max_length=20, choices=INTENT_TYPES)
    confidence = models.FloatField(default=0.0)
    parameters = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)