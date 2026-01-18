import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { WebViewWarning } from '@/components/auth/webview-warning';

export default function SignUpPage() {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chiryu Connect</h1>
        <p className="text-gray-600">知立市のボランティアマッチング</p>
      </div>
      
      <WebViewWarning />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/login"
          afterSignUpUrl="/onboarding"
        />
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="hover:text-gray-900 underline">
          ログインはこちら
        </Link>
      </div>
    </div>
  );
}
