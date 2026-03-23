export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 animate-pulse ${className}`}>
      <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
      <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3" />
      <div className="h-4 bg-gray-100 rounded-lg w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-6 w-16 bg-gray-100 rounded-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${100 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}
