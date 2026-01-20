import { getFavoritesAction } from '@/app/actions/favorites/get';
import { PostList } from '@/components/posts/post-list';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * お気に入り一覧コンポーネント（Server Component）
 */
export async function FavoriteList() {
  const result = await getFavoritesAction(100, 0);

  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {result.error}
      </div>
    );
  }

  const favorites = result.data;

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="お気に入りがありません"
        description="気になる募集をお気に入りに追加すると、ここに表示されます"
      />
    );
  }

  // お気に入り画面では、すべて「お気に入り済み」として表示したい
  return <PostList posts={favorites} forceFavorite />;
}
