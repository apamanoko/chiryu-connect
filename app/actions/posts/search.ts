'use server';

import { searchPostsWithFilters } from '@/lib/db/queries/posts';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import type { PostWithAuthor } from '@/lib/types/post';
import type { Tag } from '@/lib/types/tag';
import { PAGINATION } from '@/lib/utils/constants';

export interface SearchPostsInput {
  keyword?: string;
  tagIds?: string[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
  limit?: number;
  offset?: number;
  status?: 'active' | 'closed' | 'cancelled' | 'all';
}

export interface SearchPostsResult {
  posts: PostWithAuthor[];
  tags: Array<{ postId: string; tags: Tag[] }>;
}

/**
 * 検索Server Action（投稿とタグを含む）
 */
export async function searchPostsAction(
  input: SearchPostsInput
): Promise<
  | { success: true; data: SearchPostsResult }
  | { success: false; error: string }
> {
  try {
    const posts = await searchPostsWithFilters(
      {
        keyword: input.keyword,
        tagIds: input.tagIds,
        startDate: input.startDate,
        endDate: input.endDate,
        location: input.location,
      },
      input.limit || PAGINATION.DEFAULT_LIMIT,
      input.offset || 0,
      input.status || 'active'
    );

    // タグを取得
    const postIds = posts.map((post) => post.id);
    const tagsMap = await getTagsByPostIds(postIds);

    // Mapを配列に変換（Server Actionはシリアライズ可能な形式で返す必要がある）
    const tagsArray = Array.from(tagsMap.entries()).map(([postId, tags]) => ({
      postId,
      tags,
    }));

    return {
      success: true,
      data: {
        posts,
        tags: tagsArray,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '検索に失敗しました',
    };
  }
}
