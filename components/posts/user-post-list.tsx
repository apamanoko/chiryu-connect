import { getPostsByAuthorId } from '@/lib/db/queries/posts';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import { PostCard } from '@/components/posts/post-card';
import { Card, CardContent } from '@/components/ui/card';
import type { PostStatusType } from '@/lib/db/schema';

interface UserPostListProps {
  authorId: string;
  statusFilter?: PostStatusType | 'all';
}

/**
 * ユーザーの投稿一覧コンポーネント（Server Component）
 */
export async function UserPostList({ authorId, statusFilter = 'all' }: UserPostListProps) {
  // 投稿を取得
  const posts = await getPostsByAuthorId(authorId, 100, 0);

  // ステータスフィルタを適用
  const filteredPosts = statusFilter === 'all'
    ? posts
    : posts.filter((post) => post.status === statusFilter);

  if (filteredPosts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">
            {statusFilter === 'all' ? '投稿はまだありません' : '該当する投稿がありません'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // タグを一括取得
  const postIds = filteredPosts.map((post) => post.id);
  const tagsByPostId = await getTagsByPostIds(postIds);

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          tags={tagsByPostId.get(post.id) || []}
        />
      ))}
    </div>
  );
}
