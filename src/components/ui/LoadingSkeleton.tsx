import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string; className?: string }> = ({
  rows = 3,
  height = 'h-12',
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-2.5 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`w-full bg-slate-200/70 rounded-xl ${height}`}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 5,
  rows = 4,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-slate-200/80 rounded"
                style={{ width: `${Math.max(15, 100 / columns)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
