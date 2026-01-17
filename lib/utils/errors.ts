/**
 * アプリケーション固有のエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
    
    // Error クラスのスタックトレースを維持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * 認証エラー
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 認可エラー（権限不足）
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'この操作を実行する権限がありません') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(message: string = '入力データが不正です') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * 競合エラー（例: 重複応募）
 */
export class ConflictError extends AppError {
  constructor(message: string = 'リソースが既に存在します') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
