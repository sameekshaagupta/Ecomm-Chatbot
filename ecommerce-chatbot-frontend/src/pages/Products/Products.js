import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    min_price: '',
    max_price: '',
    in_stock: false,
    featured: false,
    sort_by: '-created_at'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_count: 0
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await api.get('/products/categories/');
        let categoriesData = [];
        
        // Handle different possible response formats
        if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        } else if (Array.isArray(categoriesResponse.data?.results)) {
          categoriesData = categoriesResponse.data.results;
        } else if (Array.isArray(categoriesResponse.data?.categories)) {
          categoriesData = categoriesResponse.data.categories;
        }
        
        setCategories(categoriesData);
        
        // Fetch brands
        const brandsResponse = await api.get('/products/brands/');
        let brandsData = [];
        
        if (Array.isArray(brandsResponse.data)) {
          brandsData = brandsResponse.data;
        } else if (Array.isArray(brandsResponse.data?.brands)) {
          brandsData = brandsResponse.data.brands;
        } else if (Array.isArray(brandsResponse.data?.results)) {
          brandsData = brandsResponse.data.results;
        }
        
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);
        if (filters.in_stock) params.append('in_stock', 'true');
        if (filters.featured) params.append('featured', 'true');
        params.append('sort_by', filters.sort_by);
        
        const response = await api.get(`/products/?${params.toString()}`);
        let productsData = [];
        let totalCount = 0;
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          productsData = response.data;
          totalCount = response.data.length;
        } else if (Array.isArray(response.data?.results)) {
          productsData = response.data.results;
          totalCount = response.data.count || response.data.results.length;
        } else if (Array.isArray(response.data?.products)) {
          productsData = response.data.products;
          totalCount = response.data.total_count || response.data.products.length;
        }
        
        setProducts(productsData);
        setPagination(prev => ({
          ...prev,
          total_count: totalCount
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({
        ...prev,
        query: searchQuery.trim()
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      min_price: '',
      max_price: '',
      in_stock: false,
      featured: false,
      sort_by: '-created_at'
    });
    setSearchQuery('');
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Our Products</h1>
          <p>Browse our wide selection of products</p>
        </div>

        <div className="products-layout">
          <aside className="products-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Search</h3>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
              </form>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">Filters</h3>
              
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.product_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Brand</label>
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, index) => (
                    typeof brand === 'string' ? (
                      <option key={index} value={brand}>
                        {brand}
                      </option>
                    ) : (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Price Range</label>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    name="min_price"
                    placeholder="Min"
                    className="form-input"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                    min="0"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="max_price"
                    placeholder="Max"
                    className="form-input"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    name="in_stock"
                    checked={filters.in_stock}
                    onChange={handleFilterChange}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={filters.featured}
                    onChange={handleFilterChange}
                  />
                  <span>Featured Products</span>
                </label>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  name="sort_by"
                  value={filters.sort_by}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                  <option value="-name">Name: Z-A</option>
                  <option value="-rating">Highest Rated</option>
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary btn-sm"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <main className="products-main">
            <div className="products-grid">
              {products.length === 0 ? (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search query</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                  <div className="debug-info">
                    <p>Debug Information:</p>
                    <p>API URL: {api.defaults.baseURL}/products/</p>
                    <p>Current Filters: {JSON.stringify(filters)}</p>
                    <button onClick={() => {
                      console.log('Products:', products);
                      console.log('Categories:', categories);
                      console.log('Brands:', brands);
                    }} className="btn btn-secondary">
                      Show Console Data
                    </button>
                  </div>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <span>🛍️</span>
                        </div>
                      )}
                      {product.featured && (
                        <div className="featured-badge">Featured</div>
                      )}
                    </div>
                    <div className="product-body">
                      <h3 className="product-title">
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="product-brand">{product.brand}</p>
                      <div className="product-meta">
                        <span className="product-price">${product.price}</span>
                        <span className={`product-stock ${product.in_stock ? 'in-stock' : 'out-stock'}`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="product-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''} ${
                              i === Math.floor(product.rating || 0) && (product.rating || 0) % 1 >= 0.5 ? 'half-filled' : ''
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span>({Number(product.rating || 0).toFixed(1)})</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;