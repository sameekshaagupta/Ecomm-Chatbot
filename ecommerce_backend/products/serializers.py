from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count', 'created_at']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name', 'price',
            'stock_quantity', 'sku', 'brand', 'rating', 'image_url',
            'is_active', 'featured', 'in_stock', 'created_at', 'updated_at'
        ]

class ProductSearchSerializer(serializers.Serializer):
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    brand = serializers.CharField(required=False, allow_blank=True)
    in_stock = serializers.BooleanField(required=False)
    featured = serializers.BooleanField(required=False)
    sort_by = serializers.ChoiceField(
        choices=['name', '-name', 'price', '-price', 'rating', '-rating', 'created_at', '-created_at'],
        required=False,
        default='-created_at'
    )