import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../Loading/LoadingSpinner';

// Lazy load the SearchResults component
const SearchResults = lazy(() => import('./SearchResults'));

const LazySearchResults = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <SearchResults {...props} />
    </Suspense>
  );
};

export default LazySearchResults;