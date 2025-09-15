import React, { lazy, Suspense } from 'react';
import MapSkeleton from './MapSkeleton';

// Lazy load the MapView component
const MapView = lazy(() => import('./MapView'));

const LazyMapView = (props) => {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapView {...props} />
    </Suspense>
  );
};

export default LazyMapView;