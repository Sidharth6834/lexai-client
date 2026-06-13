import React from 'react';

const DocumentDetailSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* HEADER BAR SKELETON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          {/* Back button */}
          <div className="h-10 w-10 bg-[#1e293b] rounded-xl flex-shrink-0"></div>
          <div className="min-w-0 flex-1 space-y-3">
            {/* Title */}
            <div className="h-8 bg-[#1e293b] rounded-xl w-3/4 max-w-xl"></div>
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-5 bg-[#1e293b] rounded-full w-24"></div>
              <div className="h-4 bg-[#1e293b] rounded w-36"></div>
              <div className="h-5 bg-[#1e293b] rounded-full w-20"></div>
              <div className="h-5 bg-[#1e293b] rounded-full w-16"></div>
            </div>
          </div>
        </div>
        {/* Action button */}
        <div className="h-11 bg-[#1e293b] rounded-xl w-full md:w-40 flex-shrink-0"></div>
      </div>

      {/* TAB BAR SKELETON */}
      <div className="flex border-b border-slate-800 space-x-4 pb-2">
        <div className="h-8 bg-[#1e293b] rounded-lg w-24"></div>
        <div className="h-8 bg-[#1e293b] rounded-lg w-32"></div>
        <div className="h-8 bg-[#1e293b] rounded-lg w-20"></div>
      </div>

      {/* CONTENT LAYOUT SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Summary / Main clauses) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <div className="h-6 bg-slate-800 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-800 rounded w-11/12"></div>
              <div className="h-4 bg-slate-800 rounded w-4/5"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="h-6 bg-slate-800 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-800 rounded w-20"></div>
              <div className="h-4 bg-slate-800 rounded w-16"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-slate-800 rounded w-16"></div>
              <div className="h-4 bg-slate-800 rounded w-12"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-slate-800 rounded w-24"></div>
              <div className="h-4 bg-slate-800 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailSkeleton;
