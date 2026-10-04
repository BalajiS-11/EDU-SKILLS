import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-slate-200 rounded-full" />
          <div className="h-9 w-72 bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-8 w-64 bg-slate-200 rounded-full" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-5">
          <div className="flex gap-2">
            <div className="h-6 w-36 bg-teal-100 rounded-full" />
            <div className="h-6 w-44 bg-rose-100 rounded-full" />
            <div className="h-6 w-28 bg-slate-100 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-80 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="xl:w-80 h-64 bg-slate-100 rounded-2xl" />
      </div>

      {/* 3 Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 h-44 flex flex-col justify-between">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-10 w-24 bg-slate-200 rounded-lg" />
            <div className="h-3 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
