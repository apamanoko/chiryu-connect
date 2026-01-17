import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 環境変数の検証（開発時のみ）
  ...(process.env.NODE_ENV === 'development' && {
    // 開発時の追加設定があればここに記述
  }),
};

export default nextConfig;
