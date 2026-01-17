import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '認証 | Chiryu Connect',
  description: '知立市のボランティアマッチングプラットフォーム',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
