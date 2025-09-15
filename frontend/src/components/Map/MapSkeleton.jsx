import React from 'react';

const MapSkeleton = () => {
  return (
    <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Map background skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300">
        {/* Fake grid pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full h-px bg-gray-400"
              style={{ top: `${i * 10}%` }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full w-px bg-gray-400"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>

      {/* Fake map markers */}
      <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
      <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>

      {/* Loading overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600 font-medium">Loading interactive map...</p>
          <p className="text-gray-500 text-sm mt-1">Finding nearby shops</p>
        </div>
      </div>

      {/* Fake zoom controls */}
      <div className="absolute top-4 right-4 bg-white rounded shadow-md">
        <div className="w-8 h-8 border-b border-gray-200 bg-gray-100 animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-100 animate-pulse"></div>
      </div>

      {/* Fake location button */}
      <div className="absolute bottom-4 right-4 w-10 h-10 bg-blue-100 rounded-full animate-pulse"></div>
    </div>
  );
};

export default MapSkeleton;