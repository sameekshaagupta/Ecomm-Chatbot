import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from products.models import Product
from products.serializers import ProductSerializer
from .models import ChatSession, ChatMessage, UserIntent
from .serializers import ChatSessionSerializer, ChatMessageSerializer, ChatInputSerializer
from .utils import ChatbotNLP, ChatbotResponseGenerator

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request):
    """Process chatbot messages and generate responses"""
    serializer = ChatInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    
    # Get or create chat session
    if session_id:
        try:
            chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            chat_session = ChatSession.objects.create(
                user=request.user,
                session_id=session_id
            )
    else:
        session_id = str(uuid.uuid4())
        chat_session = ChatSession.objects.create(
            user=request.user,
            session_id=session_id
        )
    
    # Save user message
    user_msg = ChatMessage.objects.create(
        session=chat_session,
        message_type='user',
        content=user_message
    )
    
    # Process message and generate response
    try:
        intent, confidence = ChatbotNLP.detect_intent(user_message)
        
        # Save intent
        UserIntent.objects.create(
            session=chat_session,
            intent_type=intent,
            confidence=confidence,
            parameters=ChatbotNLP.extract_search_parameters(user_message)
        )
        
        # Generate response based on intent
        if intent == 'greeting':
            bot_response = ChatbotResponseGenerator.generate_greeting_response()
            bot_metadata = {'intent': 'greeting'}
            
        elif intent == 'search':
            search_params = ChatbotNLP.extract_search_parameters(user_message)
            
            # Search products
            queryset = Product.objects.filter(is_active=True).select_related('category')
            
            if 'query' in search_params:
                from django.db.models import Q
                query = search_params['query']
                queryset = queryset.filter(
                    Q(name__icontains=query) |
                    Q(description__icontains=query) |
                    Q(brand__icontains=query) |
                    Q(category__name__icontains=query)
                )
            
            if 'category' in search_params:
                queryset = queryset.filter(category_id=search_params['category'])
            if 'min_price' in search_params:
                queryset = queryset.filter(price__gte=search_params['min_price'])
            if 'max_price' in search_params:
                queryset = queryset.filter(price__lte=search_params['max_price'])
            if 'brand' in search_params:
                queryset = queryset.filter(brand__icontains=search_params['brand'])
            
            products = list(queryset.order_by('-rating')[:10])
            bot_response = ChatbotResponseGenerator.generate_search_response(products, search_params)
            bot_metadata = {
                'intent': 'search',
                'products': ProductSerializer(products, many=True).data,
                'search_params': search_params
            }
            
        elif intent == 'help':
            bot_response = ChatbotResponseGenerator.generate_help_response()
            bot_metadata = {'intent': 'help'}
            
        else:
            bot_response = ChatbotResponseGenerator.generate_error_response()
            bot_metadata = {'intent': 'error'}
    
    except Exception as e:
        bot_response = "I'm experiencing some technical difficulties. Please try again in a moment."
        bot_metadata = {'intent': 'error', 'error': str(e)}
    
    # Save bot response
    bot_msg = ChatMessage.objects.create(
        session=chat_session,
        message_type='bot',
        content=bot_response,
        metadata=bot_metadata
    )
    
    return Response({
        'session_id': chat_session.session_id,
        'user_message': ChatMessageSerializer(user_msg).data,
        'bot_response': ChatMessageSerializer(bot_msg).data,
        'intent': intent,
        'confidence': confidence
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_sessions(request):
    """Get user's chat sessions"""
    sessions = ChatSession.objects.filter(user=request.user, is_active=True)
    serializer = ChatSessionSerializer(sessions, many=True)
    return Response({'sessions': serializer.data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_session_detail(request, session_id):
    """Get specific chat session with messages"""
    session = get_object_or_404(ChatSession, session_id=session_id, user=request.user)
    serializer = ChatSessionSerializer(session)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_chat_session(request, session_id):
    """Reset/clear a chat session"""
    session = get_object_or_404(ChatSession, session_id=session_id, user=request.user)
    session.messages.all().delete()
    session.intents.all().delete()
    
    # Create welcome message
    ChatMessage.objects.create(
        session=session,
        message_type='bot',
        content=ChatbotResponseGenerator.generate_greeting_response(),
        metadata={'intent': 'greeting', 'system': 'reset'}
    )
    
    return Response({'message': 'Chat session reset successfully'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_session(request, session_id):
    """Delete a chat session"""
    session = get_object_or_404(ChatSession, session_id=session_id, user=request.user)
    session.delete()
    return Response({'message': 'Chat session deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def product_details_for_chat(request, product_id):
    """Get detailed product information for chatbot"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        serializer = ProductSerializer(product)
        
        # Generate a detailed description for the chatbot
        details = (f"**{product.name}** by {product.brand}\n\n"
                  f"**Price:** ${product.price}\n"
                  f"**Category:** {product.category.name}\n"
                  f"**Rating:** {product.rating}/5 stars\n"
                  f"**Stock:** {'✅ Available' if product.in_stock else '❌ Out of Stock'}\n"
                  f"**SKU:** {product.sku}\n\n"
                  f"**Description:**\n{product.description}\n\n")
        
        if product.in_stock:
            details += "Would you like to know more about this product or see similar items?"
        else:
            details += "This product is currently out of stock. Would you like to see similar available products?"
        
        return Response({
            'product': serializer.data,
            'formatted_details': details
        })
        
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )