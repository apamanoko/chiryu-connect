import { db } from '../index';
import { posts, users, tags, postTags } from '../schema';
import { eq, and, desc, gte, lte, or, like, inArray } from 'drizzle-orm';
import type { Post, NewPost } from '../schema';
import type { PostWithAuthor, PostWithTags, PostWithAuthorAndTags } from '@/lib/types/post';
import type { CreatePostInput, UpdatePostInput } from '@/lib/types/post';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * 投稿一覧取得（ページネーション対応）
 * デフォルトではactiveな投稿のみを取得し、活動日時が未来のものを新しい順に返す
 */
export async function getPosts(
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  const conditions = [];
  if (status !== 'all') {
    conditions.push(eq(posts.status, status));
  }
  // 活動日時が未来のもののみ取得（activeの場合）
  if (status === 'active') {
    conditions.push(gte(posts.activityDate, new Date()));
  }

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * キーワード検索
 */
export async function searchPosts(
  keyword: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  const conditions = [];
  if (status !== 'all') {
    conditions.push(eq(posts.status, status));
  }
  // 活動日時が未来のもののみ取得（activeの場合）
  if (status === 'active') {
    conditions.push(gte(posts.activityDate, new Date()));
  }

  // キーワード検索（タイトル、説明、場所、必要なスキルで検索）
  const keywordCondition = or(
    like(posts.title, `%${keyword}%`),
    like(posts.description, `%${keyword}%`),
    like(posts.location, `%${keyword}%`),
    like(posts.requiredSkills, `%${keyword}%`)
  );
  conditions.push(keywordCondition);

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * タグでフィルタ
 */
export async function filterPostsByTags(
  tagIds: string[],
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  if (tagIds.length === 0) {
    return getPosts(limitValue, offset, status);
  }

  const conditions = [];
  if (status !== 'all') {
    conditions.push(eq(posts.status, status));
  }
  // 活動日時が未来のもののみ取得（activeの場合）
  if (status === 'active') {
    conditions.push(gte(posts.activityDate, new Date()));
  }

  // 指定されたタグを持つ投稿を取得
  const postIdsWithTags = await db
    .selectDistinct({ postId: postTags.postId })
    .from(postTags)
    .where(inArray(postTags.tagId, tagIds));

  if (postIdsWithTags.length === 0) {
    return [];
  }

  const postIds = postIdsWithTags.map((row) => row.postId);
  conditions.push(inArray(posts.id, postIds));

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * 日付範囲でフィルタ
 */
export async function filterPostsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  const conditions = [];
  if (status !== 'all') {
    conditions.push(eq(posts.status, status));
  }

  // 活動日時が指定範囲内のものを取得
  conditions.push(gte(posts.activityDate, startDate));
  conditions.push(lte(posts.activityDate, endDate));

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * 複合検索（キーワード、タグ、日付範囲を組み合わせ）
 */
export async function searchPostsWithFilters(
  options: {
    keyword?: string;
    tagIds?: string[];
    startDate?: Date;
    endDate?: Date;
    location?: string;
  },
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);
  
  const conditions = [];
  if (status !== 'all') {
    conditions.push(eq(posts.status, status));
  }
  // 活動日時が未来のもののみ取得（activeの場合）
  if (status === 'active' && !options.startDate && !options.endDate) {
    conditions.push(gte(posts.activityDate, new Date()));
  }

  // キーワード検索
  if (options.keyword && options.keyword.trim()) {
    const keywordCondition = or(
      like(posts.title, `%${options.keyword}%`),
      like(posts.description, `%${options.keyword}%`),
      like(posts.location, `%${options.keyword}%`),
      like(posts.requiredSkills, `%${options.keyword}%`)
    );
    conditions.push(keywordCondition);
  }

  // 地域フィルタ
  if (options.location && options.location.trim()) {
    conditions.push(like(posts.location, `%${options.location}%`));
  }

  // 日付範囲フィルタ
  if (options.startDate) {
    conditions.push(gte(posts.activityDate, options.startDate));
  }
  if (options.endDate) {
    conditions.push(lte(posts.activityDate, options.endDate));
  }

  // タグフィルタ
  let postIds: string[] | undefined;
  if (options.tagIds && options.tagIds.length > 0) {
    const postIdsWithTags = await db
      .selectDistinct({ postId: postTags.postId })
      .from(postTags)
      .where(inArray(postTags.tagId, options.tagIds));

    if (postIdsWithTags.length === 0) {
      return [];
    }

    postIds = postIdsWithTags.map((row) => row.postId);
    conditions.push(inArray(posts.id, postIds));
  }

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * 投稿詳細取得（ID指定）
 */
export async function getPostById(id: string): Promise<PostWithAuthorAndTags | null> {
  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  // タグを取得
  const postTagsResult = await db
    .select({
      tag: tags,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id));

  return {
    ...result[0].post,
    author: result[0].author,
    tags: postTagsResult.map((row) => row.tag),
  };
}

/**
 * 投稿者の投稿一覧取得
 */
export async function getPostsByAuthorId(
  authorId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

  const result = await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * 投稿作成
 */
export async function createPost(
  authorId: string,
  postData: CreatePostInput
): Promise<PostWithAuthorAndTags> {
  // UUIDを生成（簡易版、本番環境では適切なUUIDライブラリを使用）
  const postId = crypto.randomUUID();

  // 投稿を作成
  const newPost: NewPost = {
    id: postId,
    authorId,
    title: postData.title,
    description: postData.description,
    activityDate: postData.activityDate,
    activityEndDate: postData.activityEndDate ?? null,
    location: postData.location,
    maxParticipants: postData.maxParticipants,
    currentParticipants: 0,
    requiredSkills: postData.requiredSkills ?? null,
    rewardAmount: postData.rewardAmount ?? null,
    rewardDescription: postData.rewardDescription ?? null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [createdPost] = await db.insert(posts).values(newPost).returning();

  // タグを紐付け
  if (postData.tagIds && postData.tagIds.length > 0) {
    const postTagValues = postData.tagIds.map((tagId) => ({
      id: crypto.randomUUID(),
      postId: createdPost.id,
      tagId,
      createdAt: new Date(),
    }));

    await db.insert(postTags).values(postTagValues);
  }

  // 作成した投稿を取得（authorとtagsを含む）
  const postWithDetails = await getPostById(createdPost.id);
  if (!postWithDetails) {
    throw new Error('投稿の作成に失敗しました');
  }

  return postWithDetails;
}

/**
 * 投稿更新
 */
export async function updatePost(
  id: string,
  updateData: UpdatePostInput
): Promise<PostWithAuthorAndTags> {
  const updateValues: Partial<NewPost> = {
    updatedAt: new Date(),
  };

  if (updateData.title !== undefined) {
    updateValues.title = updateData.title;
  }
  if (updateData.description !== undefined) {
    updateValues.description = updateData.description;
  }
  if (updateData.activityDate !== undefined) {
    updateValues.activityDate = updateData.activityDate;
  }
  if (updateData.activityEndDate !== undefined) {
    updateValues.activityEndDate = updateData.activityEndDate;
  }
  if (updateData.location !== undefined) {
    updateValues.location = updateData.location;
  }
  if (updateData.maxParticipants !== undefined) {
    updateValues.maxParticipants = updateData.maxParticipants;
  }
  if (updateData.currentParticipants !== undefined) {
    updateValues.currentParticipants = updateData.currentParticipants;
  }
  if (updateData.requiredSkills !== undefined) {
    updateValues.requiredSkills = updateData.requiredSkills;
  }
  if (updateData.rewardAmount !== undefined) {
    updateValues.rewardAmount = updateData.rewardAmount;
  }
  if (updateData.rewardDescription !== undefined) {
    updateValues.rewardDescription = updateData.rewardDescription;
  }
  if (updateData.status !== undefined) {
    updateValues.status = updateData.status;
  }

  const result = await db
    .update(posts)
    .set(updateValues)
    .where(eq(posts.id, id))
    .returning();

  if (!result[0]) {
    throw new Error('投稿が見つかりません');
  }

  // タグを更新（tagIdsが指定されている場合）
  if (updateData.tagIds !== undefined) {
    // 既存のタグを削除
    await db.delete(postTags).where(eq(postTags.postId, id));

    // 新しいタグを追加
    if (updateData.tagIds.length > 0) {
      const postTagValues = updateData.tagIds.map((tagId) => ({
        id: crypto.randomUUID(),
        postId: id,
        tagId,
        createdAt: new Date(),
      }));

      await db.insert(postTags).values(postTagValues);
    }
  }

  // 更新した投稿を取得（authorとtagsを含む）
  const postWithDetails = await getPostById(id);
  if (!postWithDetails) {
    throw new Error('投稿の取得に失敗しました');
  }

  return postWithDetails;
}

/**
 * 投稿削除（論理削除）
 * statusを'cancelled'に変更
 */
export async function deletePost(id: string): Promise<Post> {
  const result = await db
    .update(posts)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  if (!result[0]) {
    throw new Error('投稿が見つかりません');
  }

  return result[0];
}
