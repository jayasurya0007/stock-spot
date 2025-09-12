import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MerchantDashboard from './components/Merchant/MerchantDashboard';
import AddMerchant from './components/Merchant/AddMerchant';
import MerchantProducts from './components/Merchant/MerchantProducts';
import AddProduct from './components/Product/AddProduct';
import EditProduct from './components/Product/EditProduct';
import SearchResults from './components/Search/SearchResults';
import MapView from './components/Map/MapView';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Only merchant users can access merchant/product management */}
        {user?.role === 'merchant' && <>
          <Route index element={<MerchantDashboard />} />
          <Route path="merchants/add" element={<AddMerchant />} />
          <Route path="merchants/:id/products" element={<MerchantProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
        </>}
        {/* All users can search and view map */}
        <Route path="search" element={<SearchResults />} />
        <Route path="map" element={<MapView />} />
        {/* Normal users see search as default dashboard */}
        {user?.role !== 'merchant' && <Route index element={<SearchResults />} />}
      </Route>
    </Routes>
  );
};

export default AppRoutes;