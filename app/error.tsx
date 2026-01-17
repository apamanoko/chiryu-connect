'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * エラーバウンダリー（ルートレベルのエラー）
 * Next.js App Routerのerror.tsxはClient Componentである必要がある
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログを記録（本番環境ではエラー監視サービスに送信）
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">エラーが発生しました</CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {error.message || '不明なエラーが発生しました'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500">
                エラーID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default" className="flex-1">
            再試行
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
          >
            ホームに戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
