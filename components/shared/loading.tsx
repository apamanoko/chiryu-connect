import { Card, CardContent } from '@/components/ui/card';

/**
 * 統一されたローディングコンポーネント
 */
export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

/**
 * カード内のローディング表示
 */
export function CardLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <Loading />
      </CardContent>
    </Card>
  );
}

/**
 * ページ全体のローディング表示
 */
export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <Loading />
    </div>
  );
}
