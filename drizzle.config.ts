import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// .env.localファイルから環境変数を読み込む
dotenv.config({ path: '.env.local' });

// 環境変数の検証
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error(
    'TURSO_DATABASE_URL is not set. Please check your .env.local file.'
  );
}

if (!authToken) {
  throw new Error(
    'TURSO_AUTH_TOKEN is not set. Please check your .env.local file.'
  );
}

// drizzle-kit 0.31.8では、Tursoの場合はdialect: 'turso'を使用
// これによりauthTokenが正しく渡される
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: databaseUrl,
    authToken: authToken,
  },
} as any); // 型エラーを回避するため一時的にanyを使用
