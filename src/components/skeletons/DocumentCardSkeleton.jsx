import React from 'react';

const DocumentCardSkeleton = () => {
  return (
    <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-pulse bg-[#131518]">
      <div className="min-w-0 flex-1 pr-4 mb-4 sm:mb-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Title skeleton */}
          <div className="h-4 bg-[#1D2026] rounded w-2/3 max-w-md"></div>
          {/* Type badge skeleton */}
          <div className="h-4 bg-[#1D2026] rounded w-16"></div>
        </div>
        {/* Date skeleton */}
        <div className="h-3 bg-[#1D2026] rounded w-28"></div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-4">
          {/* Status badge skeleton */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="h-2.5 bg-[#1D2026] rounded w-8"></div>
            <div className="h-4 bg-[#1D2026] rounded w-16"></div>
          </div>
          {/* Risk profile badge skeleton */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="h-2.5 bg-[#1D2026] rounded w-12"></div>
            <div className="h-4 bg-[#1D2026] rounded w-16"></div>
          </div>
        </div>

        {/* View button skeleton */}
        <div className="h-7 bg-[#1D2026] rounded-lg w-24"></div>
        
        {/* Delete button skeleton */}
        <div className="h-7 bg-[#1D2026] rounded-lg w-7"></div>
      </div>
    </div>
  );
};

export default DocumentCardSkeleton;
