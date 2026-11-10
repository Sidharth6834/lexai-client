import React from 'react';

const DocumentDetailSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* HEADER BAR SKELETON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#202227]">
        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
          <div className="h-9 w-9 bg-[#181A1F] rounded-lg shrink-0"></div>
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-6 bg-[#181A1F] rounded-lg w-2/3 max-w-lg"></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 bg-[#181A1F] rounded w-20"></div>
              <div className="h-4 bg-[#181A1F] rounded w-28"></div>
              <div className="h-4 bg-[#181A1F] rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="h-9 bg-[#181A1F] rounded-lg w-full md:w-36 shrink-0"></div>
      </div>

      {/* TAB BAR SKELETON */}
      <div className="flex space-x-2 pb-2">
        <div className="h-8 bg-[#181A1F] rounded-lg w-28"></div>
        <div className="h-8 bg-[#181A1F] rounded-lg w-24"></div>
        <div className="h-8 bg-[#181A1F] rounded-lg w-32"></div>
        <div className="h-8 bg-[#181A1F] rounded-lg w-20"></div>
      </div>

      {/* CONTENT LAYOUT SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131518] rounded-xl p-6 border border-[#202227] space-y-3">
            <div className="h-5 bg-[#181A1F] rounded w-1/3"></div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 bg-[#181A1F] rounded w-full"></div>
              <div className="h-3.5 bg-[#181A1F] rounded w-11/12"></div>
              <div className="h-3.5 bg-[#181A1F] rounded w-4/5"></div>
              <div className="h-3.5 bg-[#181A1F] rounded w-3/4"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#131518] rounded-xl p-5 border border-[#202227] space-y-3">
            <div className="h-4 bg-[#181A1F] rounded w-1/2"></div>
            <div className="h-16 bg-[#181A1F] rounded-lg"></div>
            <div className="h-8 bg-[#181A1F] rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailSkeleton;
