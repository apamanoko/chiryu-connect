import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

// .env.localファイルから環境変数を読み込む（seed.ts実行時）
dotenv.config({ path: '.env.local' });

/**
 * 初期タグデータをシードする
 * この関数は開発環境でのみ実行されることを想定
 */
async function seedTags() {
  // 環境変数読み込み後に動的インポートでdbとschemaを読み込む
  const { db } = await import('./index');
  const { tags } = await import('./schema');
  const initialTags = [
    { name: '高齢者支援', color: '#FF6B6B' },
    { name: '環境美化', color: '#4ECDC4' },
    { name: 'イベント運営', color: '#45B7D1' },
    { name: '子育て支援', color: '#FFA07A' },
    { name: '災害支援', color: '#98D8C8' },
    { name: 'その他', color: '#95A5A6' },
  ];

  try {
    // 既存のタグを確認
    const existingTags = await db.select().from(tags);

    if (existingTags.length > 0) {
      console.log('タグは既にシード済みです。');
      return;
    }

    // タグを挿入
    const tagData = initialTags.map((tag) => ({
      id: randomUUID(),
      name: tag.name,
      color: tag.color,
    }));

    await db.insert(tags).values(tagData);

    console.log(`${tagData.length}個のタグをシードしました。`);
  } catch (error) {
    console.error('タグのシード中にエラーが発生しました:', error);
    throw error;
  }
}

// スクリプトとして直接実行された場合
seedTags()
  .then(() => {
    console.log('シード処理が完了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('シード処理中にエラーが発生しました:', error);
    process.exit(1);
  });

export { seedTags };
