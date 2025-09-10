import { useState } from 'react'
import { searchAPI } from '../utils/api'
import { Search as SearchIcon, MapPin, Package, Star } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [distance, setDistance] = useState(5000)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLng(position.coords.longitude)
        },
        (error) => {
          setError('Unable to get your location: ' + error.message)
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query || !lat || !lng) {
      setError('Please enter a search query and location')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await searchAPI.search(query, parseFloat(lat), parseFloat(lng), distance)
      setResults(data)
    } catch (error) {
      setError(error.response?.data?.error || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Search</h1>
            
            <form onSubmit={handleSearch} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                  What are you looking for?
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="query"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                    placeholder="e.g., teddy bear, action figure, toy car"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  AI-powered search will refine your query for better results
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="lat"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="lng"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use My Location
                </button>

                <div className="flex-1">
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                    Search within {distance} meters
                  </label>
                  <input
                    type="range"
                    id="distance"
                    min="1000"
                    max="20000"
                    step="1000"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm"
                    value={distance}
                    onChange={(e) => setDistance(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Products'}
              </button>
            </form>
          </div>
        </div>

        {results && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Search Results {results.refinedQuery && `for "${results.refinedQuery}"`}
              </h2>
              
              {results.results.length === 0 ? (
                <p className="text-gray-500">No products found matching your criteria.</p>
              ) : (
                <div className="space-y-4">
                  {results.results.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.description}</p>
                          <div className="mt-2 flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {product.quantity} in stock
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {product.shop_name} ({product.distance.toFixed(0)}m away)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ₹{product.price}
                          </p>
                          <div className="mt-2 flex items-center justify-end">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {(1 - product.similarity).toFixed(2)} match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}