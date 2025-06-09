from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer, ProductSearchSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category')
        
        # Filter parameters
        category = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        brand = self.request.query_params.get('brand')
        in_stock = self.request.query_params.get('in_stock')
        featured = self.request.query_params.get('featured')
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        
        if category:
            queryset = queryset.filter(category_id=category)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if in_stock == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
        if featured == 'true':
            queryset = queryset.filter(featured=True)
            
        return queryset.order_by(sort_by)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def search_products(request):
    """Advanced product search endpoint for chatbot queries"""
    serializer = ProductSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    queryset = Product.objects.filter(is_active=True).select_related('category')
    
    # Text search across multiple fields
    query = data.get('query', '').strip()
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(brand__icontains=query) |
            Q(category__name__icontains=query)
        )
    
    # Apply filters
    if 'category' in data:
        queryset = queryset.filter(category_id=data['category'])
    if 'min_price' in data:
        queryset = queryset.filter(price__gte=data['min_price'])
    if 'max_price' in data:
        queryset = queryset.filter(price__lte=data['max_price'])
    if 'brand' in data:
        queryset = queryset.filter(brand__icontains=data['brand'])
    if 'in_stock' in data:
        if data['in_stock']:
            queryset = queryset.filter(stock_quantity__gt=0)
    if 'featured' in data:
        queryset = queryset.filter(featured=data['featured'])
    
    # Sort results
    sort_by = data.get('sort_by', '-created_at')
    queryset = queryset.order_by(sort_by)
    
    # Pagination
    page_size = min(int(request.query_params.get('page_size', 10)), 50)
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    products = queryset[start:end]
    
    return Response({
        'products': ProductSerializer(products, many=True).data,
        'total_count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_brands(request):
    """Get list of all available brands"""
    brands = Product.objects.filter(is_active=True).values_list('brand', flat=True).distinct().order_by('brand')
    return Response({'brands': list(brands)})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_products(request):
    """Get featured products"""
    products = Product.objects.filter(is_active=True, featured=True).select_related('category')[:10]
    return Response({
        'products': ProductSerializer(products, many=True).data
    })