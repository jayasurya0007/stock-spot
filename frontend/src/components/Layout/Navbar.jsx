import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notification/NotificationBell';
import { Package, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-gray-900">
              StockSpot
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <ul className="flex items-center space-x-6">
              {user ? (
                <>
                  {/* Authenticated user menu */}
                  {user.role === 'merchant' && (
                    <>
                      <li className="flex items-center">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                          Dashboard
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <Link to="/shop/update" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                          Update Shop
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <Link to="/notifications/settings" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                          Notifications
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="flex items-center">
                    <Link to="/map" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Map View
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Search
                    </Link>
                  </li>
                  {user.role === 'merchant' && (
                    <li className="flex items-center">
                      <NotificationBell />
                    </li>
                  )}
                  <li className="flex items-center">
                    <button 
                      onClick={handleLogout} 
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* Unauthenticated user menu */}
                  <li className="flex items-center">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Explore
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      Login
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 animate-slideDown">
            <ul className="space-y-2">
              {user ? (
                <>
                  {user.role === 'merchant' && (
                    <>
                      <li>
                        <Link 
                          to="/" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/shop/update" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Update Shop
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/notifications/settings" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Notifications
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link 
                      to="/map" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Map View
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/search" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Search
                    </Link>
                  </li>
                  {user.role === 'merchant' && (
                    <li>
                      <div className="px-4 py-2">
                        <NotificationBell />
                      </div>
                    </li>
                  )}
                  <li>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }} 
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/login" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;