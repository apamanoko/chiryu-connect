import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getPostById } from '@/lib/db/queries/posts';
import { getAllTags } from '@/lib/db/queries/tags';
import { PostForm } from '@/components/posts/post-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 投稿編集ページ
 */
export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  // 認証チェック
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // ユーザー情報を取得
  const user = await getCurrentUser();
  if (!user || (user.name === 'ユーザー' || !user.name)) {
    redirect('/onboarding');
  }

  // 投稿を取得
  const post = await getPostById(id);
  if (!post) {
    notFound();
  }

  // 認可チェック：投稿者のみ編集可能
  if (post.authorId !== user.id) {
    redirect(`/posts/${id}`);
  }

  // タグ一覧を取得
  const tags = await getAllTags();

  // 初期データを準備
  const initialData = {
    title: post.title,
    description: post.description,
    activityDate: post.activityDate,
    activityEndDate: post.activityEndDate,
    location: post.location,
    maxParticipants: post.maxParticipants,
    requiredSkills: post.requiredSkills,
    rewardAmount: post.rewardAmount,
    rewardDescription: post.rewardDescription,
    tagIds: post.tags.map((tag) => tag.id),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href={`/posts/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                詳細に戻る
              </Link>
            </Button>
          </div>

          {/* タイトル */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">募集を編集</h1>
            <p className="text-gray-600">募集内容を編集してください</p>
          </div>

          {/* フォーム */}
          <Card className="p-6">
            <PostForm tags={tags} postId={id} initialData={initialData} />
          </Card>
        </div>
      </div>
    </div>
  );
}
