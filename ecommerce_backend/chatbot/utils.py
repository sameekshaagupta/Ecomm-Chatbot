import re
from typing import Dict, List, Any, Tuple
from products.models import Category
from products.models import Product

class ChatbotNLP:
    """Simple NLP processor for chatbot intent recognition"""
    
    # Intent patterns
    INTENT_PATTERNS = {
        'greeting': [
            r'\b(hi|hello|hey|good morning|good afternoon|good evening)\b',
            r'\bstart\b',
        ],
        'search': [
            r'\b(search|find|look for|show me|get me)\b',
            r'\b(products?|items?)\b.*\b(with|having|contains?)\b',
            r'\bwant\b.*\b(buy|purchase)\b',
        ],
        'filter': [
            r'\b(filter|sort|order by|arrange)\b',
            r'\b(under|below|above|over)\b.*\$([\d,]+)',
            r'\b(cheap|expensive|budget|premium)\b',
        ],
        'details': [
            r'\b(details?|info|information|specs?|specifications?)\b',
            r'\btell me (about|more)\b',
        ],
        'comparison': [
            r'\b(compare|vs|versus|difference)\b',
            r'\b(better|best|worst)\b',
        ],
        'help': [
            r'\b(help|assist|support)\b',
            r'\bhow (do|can) i\b',
        ]
    }
    
    # Product attribute patterns
    ATTRIBUTE_PATTERNS = {
        'price_range': r'\$?([\d,]+)\s*-\s*\$?([\d,]+)|\$?([\d,]+)\s*(to|and)\s*\$?([\d,]+)',
        'max_price': r'under\s*\$?([\d,]+)|below\s*\$?([\d,]+)|less than\s*\$?([\d,]+)',
        'min_price': r'above\s*\$?([\d,]+)|over\s*\$?([\d,]+)|more than\s*\$?([\d,]+)',
        'brand': r'\b(apple|samsung|sony|lg|dell|hp|lenovo|asus|acer|nike|adidas|puma)\b',
        'category': r'\b(laptop|phone|tablet|headphone|speaker|shoe|shirt|book|electronics|clothing)\b',
    }

    @classmethod
    def detect_intent(cls, message: str) -> Tuple[str, float]:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        for intent, patterns in cls.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return intent, 0.8
        
        return 'other', 0.3

    @classmethod
    def extract_search_parameters(cls, message: str) -> Dict[str, Any]:
        """Extract search parameters from user message"""
        params = {}
        message_lower = message.lower()
        
        # Extract price range
        price_match = re.search(cls.ATTRIBUTE_PATTERNS['price_range'], message_lower)
        if price_match:
            prices = [int(re.sub(r'[,$]', '', p)) for p in price_match.groups() if p]
            if len(prices) >= 2:
                params['min_price'] = min(prices)
                params['max_price'] = max(prices)
        
        # Extract max price
        max_price_match = re.search(cls.ATTRIBUTE_PATTERNS['max_price'], message_lower)
        if max_price_match:
            params['max_price'] = int(re.sub(r'[,$]', '', max_price_match.group(1)))
        
        # Extract min price
        min_price_match = re.search(cls.ATTRIBUTE_PATTERNS['min_price'], message_lower)
        if min_price_match:
            params['min_price'] = int(re.sub(r'[,$]', '', min_price_match.group(1)))
        
        # Extract brand
        brand_match = re.search(cls.ATTRIBUTE_PATTERNS['brand'], message_lower)
        if brand_match:
            params['brand'] = brand_match.group(1).title()
        
        # Extract category keywords
        category_match = re.search(cls.ATTRIBUTE_PATTERNS['category'], message_lower)
        if category_match:
            category_name = category_match.group(1)
            try:
                category = Category.objects.filter(name__icontains=category_name).first()
                if category:
                    params['category'] = category.id
            except:
                pass
        
        # General search query (remove common words)
        query_words = []
        stop_words = {'i', 'want', 'need', 'looking', 'for', 'show', 'me', 'find', 'get', 'a', 'an', 'the', 'some'}
        for word in message_lower.split():
            cleaned_word = re.sub(r'[^\w]', '', word)
            if cleaned_word and cleaned_word not in stop_words and len(cleaned_word) > 2:
                query_words.append(cleaned_word)
        
        if query_words:
            params['query'] = ' '.join(query_words)
        
        return params

class ChatbotResponseGenerator:
    """Generate appropriate responses for different intents"""
    
    @staticmethod
    def generate_greeting_response() -> str:
        return ("Hello! I'm your shopping assistant. I can help you find products, "
                "compare items, and answer questions about our inventory. "
                "What are you looking for today?")
    
    @staticmethod
    def generate_search_response(products: List[Product], search_params: Dict) -> str:
        if not products:
            return ("I couldn't find any products matching your criteria. "
                   "Try adjusting your search terms or filters.")
        
        count = len(products)
        response = f"I found {count} product{'s' if count != 1 else ''} for you:\n\n"
        
        for i, product in enumerate(products[:5], 1):  # Show top 5
            response += (f"{i}. **{product.name}** by {product.brand}\n"
                        f"   Price: ${product.price}\n"
                        f"   Rating: {product.rating}/5\n"
                        f"   {'✅ In Stock' if product.in_stock else '❌ Out of Stock'}\n\n")
        
        if count > 5:
            response += f"... and {count - 5} more products.\n"
        
        response += "\nWould you like to see more details about any of these products or refine your search?"
        return response
    
    @staticmethod
    def generate_help_response() -> str:
        return ("I can help you with:\n"
                "• **Search products** - 'Find me laptops under $1000'\n"
                "• **Filter by brand** - 'Show me Apple products'\n"
                "• **Price ranges** - 'Products between $100-500'\n"
                "• **Product details** - 'Tell me about product ID 123'\n"
                "• **Compare products** - 'Compare iPhone vs Samsung'\n\n"
                "Just tell me what you're looking for in natural language!")
    
    @staticmethod
    def generate_error_response() -> str:
        return ("I'm sorry, I didn't understand that. Could you please rephrase your question? "
                "You can ask me to search for products, get product details, or type 'help' for more options.")