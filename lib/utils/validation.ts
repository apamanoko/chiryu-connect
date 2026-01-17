import { MAX_LENGTH, NUMERIC_LIMITS } from './constants';

/**
 * バリデーション結果型
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 文字列の長さをチェック
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult<string> {
  if (value.length < min) {
    return {
      success: false,
      error: `${fieldName}は${min}文字以上である必要があります`,
    };
  }
  if (value.length > max) {
    return {
      success: false,
      error: `${fieldName}は${max}文字以内である必要があります`,
    };
  }
  return { success: true, data: value };
}

/**
 * 数値の範囲をチェック
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult<number> {
  if (value < min) {
    return {
      success: false,
      error: `${fieldName}は${min}以上である必要があります`,
    };
  }
  if (value > max) {
    return {
      success: false,
      error: `${fieldName}は${max}以下である必要があります`,
    };
  }
  return { success: true, data: value };
}

/**
 * ユーザー名のバリデーション
 */
export function validateUserName(name: string): ValidationResult<string> {
  return validateLength(name, 1, MAX_LENGTH.USER_NAME, 'ユーザー名');
}

/**
 * ユーザー自己紹介のバリデーション
 */
export function validateUserBio(bio: string | null | undefined): ValidationResult<string | null> {
  if (!bio) {
    return { success: true, data: null };
  }
  const result = validateLength(bio, 0, MAX_LENGTH.USER_BIO, '自己紹介');
  if (!result.success) {
    return result;
  }
  return { success: true, data: bio };
}

/**
 * 投稿タイトルのバリデーション
 */
export function validatePostTitle(title: string): ValidationResult<string> {
  return validateLength(title, 1, MAX_LENGTH.POST_TITLE, 'タイトル');
}

/**
 * 投稿説明のバリデーション
 */
export function validatePostDescription(description: string): ValidationResult<string> {
  return validateLength(description, 1, MAX_LENGTH.POST_DESCRIPTION, '説明');
}

/**
 * 投稿場所のバリデーション
 */
export function validatePostLocation(location: string): ValidationResult<string> {
  return validateLength(location, 1, MAX_LENGTH.POST_LOCATION, '活動場所');
}

/**
 * 募集人数のバリデーション
 */
export function validateMaxParticipants(count: number): ValidationResult<number> {
  return validateRange(
    count,
    NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MIN,
    NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MAX,
    '募集人数'
  );
}

/**
 * 謝礼金額のバリデーション
 */
export function validateRewardAmount(amount: number | null | undefined): ValidationResult<number | null> {
  if (amount === null || amount === undefined) {
    return { success: true, data: null };
  }
  const result = validateRange(
    amount,
    NUMERIC_LIMITS.POST_REWARD_AMOUNT_MIN,
    Number.MAX_SAFE_INTEGER,
    '謝礼金額'
  );
  if (!result.success) {
    return result;
  }
  return { success: true, data: amount };
}

/**
 * 応募メッセージのバリデーション
 */
export function validateApplicationMessage(message: string | null | undefined): ValidationResult<string | null> {
  if (!message) {
    return { success: true, data: null };
  }
  const result = validateLength(message, 0, MAX_LENGTH.APPLICATION_MESSAGE, '応募メッセージ');
  if (!result.success) {
    return result;
  }
  return { success: true, data: message };
}

/**
 * チャットメッセージのバリデーション
 */
export function validateMessageContent(content: string): ValidationResult<string> {
  return validateLength(content, 1, MAX_LENGTH.MESSAGE_CONTENT, 'メッセージ');
}

/**
 * 日付が未来であることをチェック
 */
export function validateFutureDate(date: Date, fieldName: string): ValidationResult<Date> {
  const now = new Date();
  if (date <= now) {
    return {
      success: false,
      error: `${fieldName}は未来の日時である必要があります`,
    };
  }
  return { success: true, data: date };
}

/**
 * 日付範囲のバリデーション（終了日時が開始日時より後であることを確認）
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date | null | undefined,
  fieldName: string
): ValidationResult<Date | null> {
  if (!endDate) {
    return { success: true, data: null };
  }
  if (endDate <= startDate) {
    return {
      success: false,
      error: `${fieldName}は開始日時より後である必要があります`,
    };
  }
  return { success: true, data: endDate };
}
