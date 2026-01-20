import type { PostWithAuthor } from '@/lib/types/post';
import type { Tag } from '@/lib/types/tag';
import { PostCard } from './post-card';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import { EmptyPosts } from '@/components/shared/empty-state';

interface PostListProps {
  posts: PostWithAuthor[];
  /** すべてのお気に入りボタンを「お気に入り済み」として表示したい場合に使用 */
  forceFavorite?: boolean;
}

/**
 * 投稿一覧コンポーネント（Server Component）
 */
export async function PostList({ posts, forceFavorite = false }: PostListProps) {
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
        return (
          <PostCard
            key={post.id}
            post={post}
            tags={tags}
            initialIsFavorite={forceFavorite}
          />
        );
      })}
    </div>
  );
}
