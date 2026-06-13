import React from 'react';
import DocumentCardSkeleton from './DocumentCardSkeleton';

const StatCardSkeleton = () => (
  <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 flex items-center justify-between animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      <div className="h-8 bg-slate-800 rounded w-1/4 mt-2"></div>
    </div>
    <div className="h-12 w-12 bg-slate-800 rounded-xl"></div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* STATS ROW SKELETONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* RECENT DOCUMENTS CARD CONTAINER SKELETON */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <div className="h-6 bg-slate-800 rounded w-36 animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded w-16 animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-800">
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
