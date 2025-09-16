import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, Search, Zap, Bell, BarChart3 } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isMapLoading, setIsMapLoading] = useState(false);

  const handleExploreMap = () => {
    setIsMapLoading(true);
    setTimeout(() => {
      if (isAuthenticated) {
        if (user?.role === 'merchant') {
          navigate('/dashboard');
        } else {
          navigate('/search');
        }
      } else {
        navigate('/map');
      }
      setIsMapLoading(false);
    }, 800);
  };

  useEffect(() => {
    const preloadMap = () => {
      import('../Map/LazyMapView');
      import('../Search/SearchResults');
    };
    
    const timer = setTimeout(preloadMap, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-xl shadow-md">
                <Package className="w-12 h-12 text-blue-600 sm:w-16 sm:h-16" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              StockSpot
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Agentic AI for Local Commerce
            </p>
            
            <p className="text-gray-500 mb-10 max-w-4xl mx-auto">
              Transform local commerce with intelligent AI that connects customers to nearby inventory through 
              natural language search and semantic matching. Find what you need instantly, boost local business visibility.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleExploreMap}
                disabled={isMapLoading}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-70"
              >
                {isMapLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <MapPin size={20} className="mr-2" />
                    Explore Map
                  </div>
                )}
              </button>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300 text-center"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How StockSpot Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of local commerce with our agentic AI system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600">
                "I need a phone charger" finds relevant products using natural language AI processing
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Aware</h3>
              <p className="text-gray-600">
                Find products in nearby stores with precise location-based filtering and directions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Enhanced</h3>
              <p className="text-gray-600">
                Multi-step AI workflows enhance product descriptions and provide intelligent recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powering Local Commerce
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Query Accuracy</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-green-600 mb-2">&lt;200ms</div>
              <div className="text-gray-600">Search Response</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">AI Monitoring</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-2">Vector</div>
              <div className="text-gray-600">Semantic Search</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience StockSpot?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Try searching for "teddy bear", "educational toys", or "toy car" to see our AI in action
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExploreMap}
              disabled={isMapLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md disabled:opacity-70"
            >
              {isMapLoading ? 'Loading...' : 'Start Exploring'}
            </button>
            
            {!isAuthenticated && (
              <Link
                to="/login"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-colors duration-200 text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;