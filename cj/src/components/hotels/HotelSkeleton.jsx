import React from 'react';

export default function HotelSkeleton() {
  const SKELETONS = [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SKELETONS.map((id) => (
        <div key={id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gray-200"></div>
          
          {/* Content skeleton */}
          <div className="p-5 flex flex-col gap-4">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>

            <div className="flex justify-between items-end pt-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="flex flex-col items-end gap-1">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
