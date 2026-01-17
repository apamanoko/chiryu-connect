import { redirect } from 'next/navigation';
import { getCurrentUser, createOrUpdateUser } from '@/lib/actions/auth';
import { OnboardingForm } from './_components/onboarding-form';

export default async function OnboardingPage() {
  // 認証チェック
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/login');
  }

  // 既存ユーザーを確認
  const existingUser = await getCurrentUser();
  
  // 既にユーザーが存在し、プロフィールが設定されている場合はホームにリダイレクト
  if (existingUser && existingUser.name && existingUser.name !== 'ユーザー') {
    redirect('/');
  }

  // ユーザーが存在しない場合は作成（Clerkから情報を取得）
  // 既に存在する場合は、プロフィール設定フォームを表示（nameが'ユーザー'のままの場合）
  if (!existingUser) {
    await createOrUpdateUser(userId);
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール設定</h1>
        <p className="text-gray-600">はじめに、あなたの名前と自己紹介を設定してください</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <OnboardingForm />
      </div>
    </div>
  );
}
