import { Skeleton } from "@/components/ui/primitives";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-28" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-5 h-56 w-full" />
        </div>
        <div className="card p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-48 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}