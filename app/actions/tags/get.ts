'use server';

import { getAllTags, getTagsByPostId } from '@/lib/db/queries/tags';
import type { Tag } from '@/lib/types/tag';

/**
 * タグ一覧取得Server Action
 */
export async function getAllTagsAction(): Promise<
  { success: true; data: Tag[] } | { success: false; error: string }
> {
  try {
    const tags = await getAllTags();
    return {
      success: true,
      data: tags,
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
      error: 'タグ一覧の取得に失敗しました',
    };
  }
}

/**
 * 投稿のタグ取得Server Action
 */
export async function getTagsByPostIdAction(
  postId: string
): Promise<{ success: true; data: Tag[] } | { success: false; error: string }> {
  try {
    const tags = await getTagsByPostId(postId);
    return {
      success: true,
      data: tags,
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
      error: 'タグの取得に失敗しました',
    };
  }
}
