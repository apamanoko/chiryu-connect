import { BottomNavigation } from '@/components/shared/bottom-navigation';

/**
 * メインアプリケーションのレイアウト
 * ボトムナビゲーションを全画面に表示
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  );
}
