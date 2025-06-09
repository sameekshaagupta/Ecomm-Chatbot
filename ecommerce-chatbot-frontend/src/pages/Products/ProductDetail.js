import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';  // Added Link here
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}/`);
        setProduct(response.data);
        
        // Fetch related products
        const relatedResponse = await api.get(`/products/?category=${response.data.category.id}&limit=4`);
        setRelatedProducts(relatedResponse.data.filter(p => p.id !== response.data.id));
      } catch (error) {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    toast.success('Product added to cart!');
    // In a real app, you would add to cart state/context
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-gallery">
            {product.image_url ? (
              <div className="main-image">
                <img src={product.image_url} alt={product.name} />
              </div>
            ) : (
              <div className="main-image placeholder">
                <span>🛍️</span>
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
              <div className="product-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.floor(product.rating) ? 'filled' : ''} ${
                      i === Math.floor(product.rating) && product.rating % 1 >= 0.5 ? 'half-filled' : ''
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span>({Number(product.rating || 0).toFixed(1)})</span>
              </div>
              
              <span className={`product-stock ${product.in_stock ? 'in-stock' : 'out-stock'}`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="product-price">
              ${product.price}
              {product.featured && (
                <span className="featured-badge">Featured</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-specs">
              <h3>Details</h3>
              <ul>
                <li>
                  <strong>Brand:</strong> {product.brand}
                </li>
                <li>
                  <strong>SKU:</strong> {product.sku}
                </li>
                <li>
                  <strong>Category:</strong> {product.category_name}
                </li>
              </ul>
            </div>

            {product.in_stock && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>You may also like</h2>
            <div className="related-products-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="related-product-card">
                  <Link to={`/products/${product.id}`} className="related-product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="image-placeholder">
                        <span>🛍️</span>
                      </div>
                    )}
                  </Link>
                  <div className="related-product-info">
                    <h3>
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="related-product-price">${product.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;