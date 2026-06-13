import React from 'react';

const DocumentCardSkeleton = () => {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/50 animate-pulse bg-slate-900/10">
      <div className="min-w-0 flex-1 pr-4 mb-4 sm:mb-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Title skeleton */}
          <div className="h-5 bg-slate-850 rounded w-2/3 max-w-md"></div>
          {/* Type badge skeleton */}
          <div className="h-5 bg-slate-800 rounded-full w-16"></div>
        </div>
        {/* Date skeleton */}
        <div className="h-3.5 bg-slate-800 rounded w-32"></div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-4">
          {/* Status badge skeleton */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="h-3 bg-slate-800 rounded w-10"></div>
            <div className="h-5 bg-slate-800 rounded-full w-20"></div>
          </div>
          {/* Risk profile badge skeleton */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="h-3 bg-slate-800 rounded w-16"></div>
            <div className="h-5 bg-slate-800 rounded-full w-16"></div>
          </div>
        </div>

        {/* View button skeleton */}
        <div className="h-8 bg-slate-800 rounded-xl w-28"></div>
        
        {/* Delete button skeleton */}
        <div className="h-8 bg-slate-800 rounded-xl w-8"></div>
      </div>
    </div>
  );
};

export default DocumentCardSkeleton;
