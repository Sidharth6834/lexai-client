import React from 'react';
import DocumentCardSkeleton from './DocumentCardSkeleton';

const StatCardSkeleton = () => (
  <div className="bg-[#131518] p-5 rounded-xl border border-[#202227] flex items-center justify-between animate-pulse">
    <div className="space-y-2.5 flex-1">
      <div className="h-3 bg-[#1D2026] rounded w-1/2"></div>
      <div className="h-7 bg-[#1D2026] rounded w-1/4 mt-2"></div>
    </div>
    <div className="h-10 w-10 bg-[#1D2026] rounded-lg"></div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* STATS ROW SKELETONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* RECENT DOCUMENTS CARD CONTAINER SKELETON */}
      <div className="bg-[#131518] rounded-xl border border-[#202227] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#202227] flex justify-between items-center bg-[#0E0F12]">
          <div className="h-4 bg-[#1D2026] rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-[#1D2026] rounded w-14 animate-pulse"></div>
        </div>
        <div className="divide-y divide-[#202227]">
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
