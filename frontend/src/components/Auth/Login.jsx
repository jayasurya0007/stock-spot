import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import  LoadingSpinner from '../Loading/LoadingSpinner';
import { User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }
    
    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-4 pb-8 px-4 sm:px-6 lg:px-8 sm:pt-6 lg:pt-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 sm:p-8 mt-4 sm:mt-6">
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-blue-100 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-blue-600 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Login to StockSpot</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Welcome back! Please sign in to your account.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;