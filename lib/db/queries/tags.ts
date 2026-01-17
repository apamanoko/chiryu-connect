import { db } from '../index';
import { tags, postTags } from '../schema';
import { eq, inArray, and } from 'drizzle-orm';
import type { Tag, NewPostTag } from '../schema';

/**
 * 全タグ取得
 */
export async function getAllTags(): Promise<Tag[]> {
  const result = await db.select().from(tags).orderBy(tags.name);
  return result;
}

/**
 * 投稿のタグ取得
 */
export async function getTagsByPostId(postId: string): Promise<Tag[]> {
  const result = await db
    .select({
      tag: tags,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));

  return result.map((row) => row.tag);
}

/**
 * 複数の投稿のタグを一括取得
 * 投稿IDの配列を受け取り、各投稿のタグを取得
 */
export async function getTagsByPostIds(postIds: string[]): Promise<Map<string, Tag[]>> {
  if (postIds.length === 0) {
    return new Map();
  }

  const result = await db
    .select({
      postId: postTags.postId,
      tag: tags,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  // 投稿IDごとにタグをグループ化
  const tagsMap = new Map<string, Tag[]>();
  for (const row of result) {
    const existingTags = tagsMap.get(row.postId) || [];
    tagsMap.set(row.postId, [...existingTags, row.tag]);
  }

  // タグがない投稿も含める
  for (const postId of postIds) {
    if (!tagsMap.has(postId)) {
      tagsMap.set(postId, []);
    }
  }

  return tagsMap;
}

/**
 * 投稿とタグの紐付け作成
 */
export async function createPostTag(postId: string, tagId: string): Promise<void> {
  const newPostTag: NewPostTag = {
    id: crypto.randomUUID(),
    postId,
    tagId,
    createdAt: new Date(),
  };

  await db.insert(postTags).values(newPostTag);
}

/**
 * 投稿とタグの紐付けを一括作成
 */
export async function createPostTags(postId: string, tagIds: string[]): Promise<void> {
  if (tagIds.length === 0) {
    return;
  }

  const postTagValues: NewPostTag[] = tagIds.map((tagId) => ({
    id: crypto.randomUUID(),
    postId,
    tagId,
    createdAt: new Date(),
  }));

  await db.insert(postTags).values(postTagValues);
}

/**
 * 投稿とタグの紐付け削除（1つのタグ）
 */
export async function deletePostTag(postId: string, tagId: string): Promise<void> {
  await db
    .delete(postTags)
    .where(and(eq(postTags.postId, postId), eq(postTags.tagId, tagId)));
}

/**
 * 投稿とタグの紐付け削除（投稿のすべてのタグ）
 */
export async function deletePostTags(postId: string): Promise<void> {
  await db.delete(postTags).where(eq(postTags.postId, postId));
}

/**
 * タグIDでタグを取得
 */
export async function getTagById(tagId: string): Promise<Tag | null> {
  const result = await db.select().from(tags).where(eq(tags.id, tagId)).limit(1);
  return result[0] ?? null;
}

/**
 * タグ名でタグを取得
 */
export async function getTagByName(name: string): Promise<Tag | null> {
  const result = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
  return result[0] ?? null;
}
