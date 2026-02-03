'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

/**
 * ゲストログインボタン
 * - Clerk上に用意したゲストユーザー（メール＋パスワード）で自動ログイン
 * - 環境変数 NEXT_PUBLIC_GUEST_EMAIL / NEXT_PUBLIC_GUEST_PASSWORD を使用
 */
export function GuestLoginButton() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL;
  const guestPassword = process.env.NEXT_PUBLIC_GUEST_PASSWORD;

  // ゲスト用のメール・パスワードが設定されていない場合はボタンを表示しない
  if (!guestEmail || !guestPassword) {
    return null;
  }

  const handleGuestLogin = () => {
    if (!isLoaded || isPending) return;

    setError(null);

    startTransition(async () => {
      try {
        // 1. ゲストユーザーを識別子で指定
        await signIn.create({
          identifier: guestEmail,
        });

        // 2. パスワードで第1要素認証を試行
        const result = await signIn.attemptFirstFactor({
          strategy: 'password',
          password: guestPassword,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          addToast({
            type: 'success',
            title: 'ゲストログインしました',
            description: 'Chiryu Connect をお試しいただけます。',
          });
          router.push('/');
          return;
        }

        // 第2要素などが有効になっている場合
        if (result.status === 'needs_second_factor') {
          setError('このゲストユーザーには二段階認証が有効です。通常ログインをご利用ください。');
          return;
        }

        // それ以外の想定外ステータス
        setError('ゲストログインに失敗しました。通常ログインをご利用ください。');
      } catch (err: unknown) {
        let message = 'ゲストログインに失敗しました';

        if (typeof err === 'object' && err && 'errors' in err) {
          const anyErr = err as { errors?: Array<{ message?: string }> };
          if (anyErr.errors && anyErr.errors[0]?.message) {
            message = anyErr.errors[0].message;
          }
        }

        setError(message);
        addToast({
          type: 'error',
          title: 'ゲストログインに失敗しました',
          description: message,
        });
      }
    });
  };

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}
      <Button
        type="button"
        onClick={handleGuestLogin}
        disabled={!isLoaded || isPending}
        className="w-full"
        variant="outline"
      >
        ゲストログイン（お試し）
      </Button>
      <p className="text-xs text-gray-500 text-center">
        アカウント登録なしで、テスト用ユーザーとしてアプリを体験できます。
      </p>
    </div>
  );
}

