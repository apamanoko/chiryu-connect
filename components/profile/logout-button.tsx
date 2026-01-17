'use client';

import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

/**
 * ログアウトボタンコンポーネント（Client Component）
 */
export function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/login">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
      >
        <LogOut className="w-4 h-4 mr-2" />
        ログアウト
      </Button>
    </SignOutButton>
  );
}
