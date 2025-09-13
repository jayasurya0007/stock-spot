//src/routes.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MerchantDashboard from './components/Merchant/MerchantDashboard';
import MerchantProducts from './components/Merchant/MerchantProducts';
import UpdateShopDetails from './components/Merchant/UpdateShopDetails';
import AddProduct from './components/Product/AddProduct';
import EditProduct from './components/Product/EditProduct';
import SearchResults from './components/Search/SearchResults';
import CitySearch from './components/Search/CitySearch';
import MapView from './components/Map/MapView';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Debug logging
  console.log('AppRoutes - User:', user);
  console.log('AppRoutes - isAuthenticated:', isAuthenticated);
  console.log('AppRoutes - loading:', loading);
  
  if (loading) return <div className="loading">Loading...</div>;
  return (
    <Routes>
      {/* Always use Layout wrapper */}
      <Route path="/" element={<Layout />}>
        {/* Public routes for unauthenticated users */}
        {!isAuthenticated && <>
          <Route index element={<MapView publicView={true} />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="city-search" element={<CitySearch />} />
          <Route path="*" element={<MapView publicView={true} />} />
        </>}
        {/* Authenticated routes */}
        {isAuthenticated && <>
          {/* Debug route */}
          <Route path="debug" element={
            <div style={{ padding: '2rem' }}>
              <h2>Debug Info</h2>
              <p><strong>User:</strong> {JSON.stringify(user)}</p>
              <p><strong>Is Authenticated:</strong> {isAuthenticated.toString()}</p>
              <p><strong>User Role:</strong> {user?.role || 'No role'}</p>
            </div>
          } />
          
          {/* Merchant dashboard and inventory management */}
          {user?.role === 'merchant' ? (
            <>
              <Route index element={<MerchantDashboard />} />
              <Route path="products" element={<MerchantProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="shop/update" element={<UpdateShopDetails />} />
            </>
          ) : (
            /* User dashboard: product search and map */
            <Route index element={<SearchResults />} />
          )}
          <Route path="search" element={<SearchResults />} />
          <Route path="city-search" element={<CitySearch />} />
          <Route path="map" element={<MapView />} />
          <Route path="merchant/:id/products" element={<MerchantProducts />} />
          <Route path="*" element={<div className="error">Page not found</div>} />
        </>}
      </Route>
    </Routes>
  );
};

export default AppRoutes;