'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, PlusCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ボトムナビゲーションバーコンポーネント（Client Component）
 * LINEやAirbnb風のデザイン
 */
export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'ホーム',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/posts/new',
      label: '投稿',
      icon: PlusCircle,
      active: pathname === '/posts/new',
    },
    {
      href: '/chat',
      label: 'チャット',
      icon: MessageCircle,
      active: pathname?.startsWith('/chat'),
    },
    {
      href: '/profile',
      label: 'マイページ',
      icon: User,
      active: pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[60px] min-h-[44px] px-3 py-2 rounded-lg transition-colors',
                  item.active
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/50'
                )}
              >
                <Icon className={cn('w-6 h-6', item.active && 'text-orange-600')} />
                <span className={cn('text-xs font-medium', item.active && 'text-orange-600')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
