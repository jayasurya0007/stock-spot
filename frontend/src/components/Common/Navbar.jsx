import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ShoppingCart, Map, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-xl font-bold text-blue-600">
              <ShoppingCart className="h-8 w-8 mr-2" />
              StockSpot
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/search" 
              className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              <Map className="h-5 w-5 mr-1" />
              Search
            </Link>
            
            {user?.role === 'merchant' || user?.role === 'admin' ? (
              <Link 
                to="/merchant" 
                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                <User className="h-5 w-5 mr-1" />
                Merchant Dashboard
              </Link>
            ) : null}
            
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                Hello, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}