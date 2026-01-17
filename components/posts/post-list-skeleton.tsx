import { Card } from '@/components/ui/card';

/**
 * 投稿一覧のスケルトンローダー
 */
export function PostListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </Card>
      ))}
    </div>
  );
}
