import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notification/NotificationBell';
import { Package, Menu, X } from 'lucide-react';
import '../../styles/Navbar.css'; // Import the CSS file for animations

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-gray-900">
              StockSpot
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Authenticated user menu */}
                {user.role === 'merchant' && (
                  <>
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/shop/update" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Update Shop
                    </Link>
                    <Link to="/notifications/settings" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Notifications
                    </Link>
                  </>
                )}
                <Link to="/map" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Map View
                </Link>
                <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Search
                </Link>
                {user.role === 'merchant' && (
                  <div className="flex items-center">
                    <NotificationBell />
                  </div>
                )}
                <button 
                  onClick={handleLogout} 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Unauthenticated user menu */}
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Explore
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 py-4 mobile-menu">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  {user.role === 'merchant' && (
                    <>
                      <Link 
                        to="/" 
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/shop/update" 
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Update Shop
                      </Link>
                      <Link 
                        to="/notifications/settings" 
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                    </>
                  )}
                  <Link 
                    to="/map" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Map View
                  </Link>
                  <Link 
                    to="/search" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Search
                  </Link>
                  {user.role === 'merchant' && (
                    <div className="px-4 py-2">
                      <NotificationBell />
                    </div>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Explore
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="mx-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;