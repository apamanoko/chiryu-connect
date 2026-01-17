import { db } from '../index';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser } from '../schema';
import type { UpdateUserProfileInput } from '@/lib/types/user';

/**
 * IDでユーザーを取得
 */
export async function getUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Clerk IDでユーザーを取得
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * ユーザーを作成
 */
export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

/**
 * ユーザーを更新
 */
export async function updateUser(
  id: string,
  updateData: UpdateUserProfileInput
): Promise<User> {
  const updateValues: Partial<NewUser> = {
    updatedAt: new Date(),
  };

  if (updateData.name !== undefined) {
    updateValues.name = updateData.name;
  }
  if (updateData.bio !== undefined) {
    updateValues.bio = updateData.bio;
  }
  if (updateData.avatarUrl !== undefined) {
    updateValues.avatarUrl = updateData.avatarUrl;
  }

  const result = await db
    .update(users)
    .set(updateValues)
    .where(eq(users.id, id))
    .returning();

  if (!result[0]) {
    throw new Error('ユーザーが見つかりません');
  }

  return result[0];
}
