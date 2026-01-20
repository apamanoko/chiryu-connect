/**
 * 入力中状態管理（メモリベース）
 * アプリケーション再起動でリセットされるが、シンプルな実装のためメモリベースを使用
 */

// applicationId -> userId -> timestamp
const typingStatus = new Map<string, Map<string, number>>();

// タイムアウト時間（3秒間入力がなければ「入力中」を解除）
const TYPING_TIMEOUT = 3000;

/**
 * 入力中状態を設定
 * @param applicationId 応募ID
 * @param userId ユーザーID
 */
export function setTyping(applicationId: string, userId: string): void {
  if (!typingStatus.has(applicationId)) {
    typingStatus.set(applicationId, new Map());
  }

  const userMap = typingStatus.get(applicationId)!;
  userMap.set(userId, Date.now());
}

/**
 * 入力中状態を解除
 * @param applicationId 応募ID
 * @param userId ユーザーID
 */
export function clearTyping(applicationId: string, userId: string): void {
  const userMap = typingStatus.get(applicationId);
  if (userMap) {
    userMap.delete(userId);
    if (userMap.size === 0) {
      typingStatus.delete(applicationId);
    }
  }
}

/**
 * 入力中状態を取得（タイムアウトチェック付き）
 * @param applicationId 応募ID
 * @param currentUserId 現在のユーザーID（自分は除外）
 * @returns 入力中ユーザーIDの配列
 */
export function getTypingUsers(applicationId: string, currentUserId: string): string[] {
  const userMap = typingStatus.get(applicationId);
  if (!userMap) {
    return [];
  }

  const now = Date.now();
  const typingUsers: string[] = [];

  // タイムアウトチェックとクリーンアップ
  for (const [userId, timestamp] of userMap.entries()) {
    // 自分は除外
    if (userId === currentUserId) {
      continue;
    }

    // タイムアウトチェック
    if (now - timestamp < TYPING_TIMEOUT) {
      typingUsers.push(userId);
    } else {
      // タイムアウトしたユーザーを削除
      userMap.delete(userId);
    }
  }

  // 空になったら削除
  if (userMap.size === 0) {
    typingStatus.delete(applicationId);
  }

  return typingUsers;
}
