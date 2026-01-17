import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * 投稿が見つからない場合の404ページ
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-lg text-gray-600 mb-6">
            投稿が見つかりませんでした
          </p>
          <p className="text-sm text-gray-500 mb-8">
            この投稿は削除されたか、存在しない可能性があります。
          </p>
          <Button asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
