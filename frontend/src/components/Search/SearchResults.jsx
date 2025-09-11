import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { searchService } from '../../services/search';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchData) => {
    try {
      setLoading(true);
      setError('');
      const data = await searchService.searchProducts(searchData);
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Product Search</h1>
      <SearchBar onSearch={handleSearch} />
      
      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}
      
      {results.length > 0 && (
        <div>
          <h2>Search Results</h2>
          {results.map(product => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              <p><strong>Merchant:</strong> {product.shop_name}</p>
              <p><strong>Distance:</strong> {(product.distance / 1000).toFixed(2)} km</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;