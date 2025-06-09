import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Shop with AI Assistance</h1>
            <p className="hero-subtitle">
              Discover amazing products with the help of our intelligent chatbot
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/chat" className="btn btn-primary btn-lg">
                  Start Chatting
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="grid grid-cols-3">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Powered Chat</h3>
              <p className="feature-description">
                Our chatbot understands natural language to help you find exactly what you need.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Smart Search</h3>
              <p className="feature-description">
                Find products by describing what you want in your own words.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3 className="feature-title">Personalized Shopping</h3>
              <p className="feature-description">
                Get recommendations based on your preferences and browsing history.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;