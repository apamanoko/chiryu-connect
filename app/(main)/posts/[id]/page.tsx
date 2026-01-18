import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/db/queries/posts';
import { getCurrentUser } from '@/lib/actions/auth';
import { getApplicationByPostAndApplicant } from '@/lib/db/queries/applications';
import { PostDetail } from '@/components/posts/post-detail';
import { ApplicationButton } from '@/components/applications/application-button';
import { ApplicationList } from '@/components/applications/application-list';
import { PostActions } from '@/components/posts/post-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 投稿詳細ページ
 */
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  // 投稿を取得
  const post = await getPostById(id);

  // 投稿が見つからない場合は404
  if (!post) {
    notFound();
  }

  // 現在のユーザーを取得
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id || null;

  // 既存の応募を取得（現在のユーザーが応募している場合）
  let existingApplication = null;
  if (currentUserId) {
    existingApplication = await getApplicationByPostAndApplicant(id, currentUserId);
  }

  // 募集者かどうかを確認
  const isPostAuthor = currentUserId === post.authorId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 戻るボタン */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                一覧に戻る
              </Link>
            </Button>
          </div>

          {/* 投稿詳細 */}
          <PostDetail post={post} />

          {/* 編集・取消ボタン（募集者のみ表示） */}
          {isPostAuthor && currentUserId && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <PostActions
                  postId={post.id}
                  postStatus={post.status as 'active' | 'closed' | 'cancelled'}
                />
              </CardContent>
            </Card>
          )}

          {/* 応募ボタン（募集者以外、応募可能な場合のみ表示） */}
          {currentUserId && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <ApplicationButton
                  postId={post.id}
                  postAuthorId={post.authorId}
                  currentUserId={currentUserId}
                  existingApplication={existingApplication}
                  postStatus={post.status as 'active' | 'closed' | 'cancelled'}
                  currentParticipants={post.currentParticipants}
                  maxParticipants={post.maxParticipants}
                />
              </CardContent>
            </Card>
          )}

          {/* 応募者一覧（募集者のみ表示） */}
          {isPostAuthor && currentUserId && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">応募者一覧</h2>
                <ApplicationList
                  postId={post.id}
                  currentUserId={currentUserId}
                  isPostAuthor={isPostAuthor}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
