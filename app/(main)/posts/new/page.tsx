import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAllTags } from '@/lib/db/queries/tags';
import { PostForm } from '@/components/posts/post-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * 投稿作成ページ
 */
export default async function NewPostPage() {
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();

  // 未認証の場合はログイン画面にリダイレクト
  if (!userId) {
    redirect('/login');
  }

  // 認証済みの場合、ユーザー情報を取得
  const user = await getCurrentUser();

  // ユーザーが存在しない、またはプロフィール未設定の場合はオンボーディングにリダイレクト
  if (!user || (user.name === 'ユーザー' || !user.name)) {
    redirect('/onboarding');
  }

  // タグ一覧を取得
  const tags = await getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                一覧に戻る
              </Link>
            </Button>
          </div>

          {/* タイトル */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">募集を投稿</h1>
            <p className="text-gray-600">新しいボランティア募集を投稿してください</p>
          </div>

          {/* フォーム */}
          <Card className="p-6">
            <PostForm tags={tags} />
          </Card>
        </div>
      </div>
    </div>
  );
}
