import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchAPI } from '../utils/api'
import { MapPin, Package, Search } from 'lucide-react'

export default function Dashboard() {
  const [mapData, setMapData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await searchAPI.getMapData()
        setMapData(data)
      } catch (error) {
        console.error('Failed to fetch map data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to StockSpot</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">Product Search</h2>
                    <p className="mt-1 text-sm text-gray-500">Find products near you with AI-powered search</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start Searching
                  </Link>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">Local Merchants</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {mapData.length} merchants in your area
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">Product Inventory</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {mapData.reduce((total, merchant) => total + merchant.product_count, 0)} products available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Merchants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapData.slice(0, 6).map((merchant) => (
                  <div key={merchant.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-gray-900">{merchant.shop_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {merchant.product_count} products available
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {merchant.latitude.toFixed(4)}, {merchant.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}