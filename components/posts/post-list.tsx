import type { PostWithAuthor } from '@/lib/types/post';
import type { Tag } from '@/lib/types/tag';
import { PostCard } from './post-card';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import { EmptyPosts } from '@/components/shared/empty-state';

interface PostListProps {
  posts: PostWithAuthor[];
}

/**
 * 投稿一覧コンポーネント（Server Component）
 */
export async function PostList({ posts }: PostListProps) {
  // すべての投稿のタグを一括取得
  const postIds = posts.map((post) => post.id);
  const tagsMap = await getTagsByPostIds(postIds);

  if (posts.length === 0) {
    return <EmptyPosts />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const tags = tagsMap.get(post.id) || [];
        return <PostCard key={post.id} post={post} tags={tags} />;
      })}
    </div>
  );
}
