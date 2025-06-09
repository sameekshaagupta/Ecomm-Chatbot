import React from 'react';
import Home from './pages/HomePage';
import Dashboard from './pages/ProductsPage';
import ProductsPage from './pages/AuthPage';
import Profile from './pages/DashboardPage';
import Login from './components/common/Footer';
import Register from './components/common/Register';
import NotFound from './pages/ProductDetailPage';

const routes = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/products',
    element: <ProductsPage />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;