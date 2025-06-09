from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductDetailView,
    search_products, get_brands, get_featured_products
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('search/', search_products, name='product-search'),
    path('brands/', get_brands, name='product-brands'),
    path('featured/', get_featured_products, name='featured-products'),
]