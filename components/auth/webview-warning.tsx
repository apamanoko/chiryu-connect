'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * WebView検出と警告表示コンポーネント
 * Google OAuthはWebView（アプリ内ブラウザ）を許可していないため、
 * 外部ブラウザで開くよう促す
 */
export function WebViewWarning() {
  const [isWebView, setIsWebView] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    // WebViewを検出
    const userAgent = navigator.userAgent.toLowerCase();
    
    // OS判定
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (/android/.test(userAgent)) {
      setOs('android');
    } else {
      setOs('unknown');
    }

    const isInAppBrowser =
      // iOS WebView
      (userAgent.includes('iphone') || userAgent.includes('ipad')) &&
      !userAgent.includes('safari') &&
      !userAgent.includes('crios') &&
      !userAgent.includes('fxios') &&
      // Android WebView
      (userAgent.includes('wv') ||
        (userAgent.includes('android') && !userAgent.includes('chrome')));

    // その他のWebView検出
    const isWebViewDetected =
      isInAppBrowser ||
      userAgent.includes('webview') ||
      userAgent.includes('webviewer') ||
      // Facebook、Twitter、LINEなどのアプリ内ブラウザ
      userAgent.includes('fban') ||
      userAgent.includes('fbav') ||
      userAgent.includes('line') ||
      userAgent.includes('twitter') ||
      userAgent.includes('instagram') ||
      userAgent.includes('linkedinapp') ||
      userAgent.includes('snapchat') ||
      userAgent.includes('pinterest') ||
      userAgent.includes('whatsapp') ||
      userAgent.includes('messenger') ||
      userAgent.includes('wechat') ||
      userAgent.includes('qqbrowser') ||
      userAgent.includes('ucbrowser') ||
      userAgent.includes('baiduboxapp');

    setIsWebView(isWebViewDetected);
  }, []);

  if (!isWebView) {
    return null;
  }

  const getInstructions = () => {
    if (os === 'ios') {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>右上の「...」または「共有」アイコンをタップ</li>
          <li>「Safariで開く」を選択</li>
          <li>Safariで再度アクセスしてください</li>
        </ol>
      );
    } else if (os === 'android') {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>右上の「...」または「メニュー」アイコンをタップ</li>
          <li>「Chromeで開く」または「ブラウザで開く」を選択</li>
          <li>外部ブラウザで再度アクセスしてください</li>
        </ol>
      );
    } else {
      return (
        <p className="text-sm text-gray-700">
          外部ブラウザ（Safari、Chrome、Firefoxなど）で開いてください。
        </p>
      );
    }
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-2">
              外部ブラウザを使用してください
            </h3>
            <p className="text-sm text-orange-800 mb-3">
              アプリ内ブラウザでは認証が正常に動作しない場合があります。
              外部ブラウザで開くことをお勧めします。
            </p>
            <div className="bg-white rounded-md p-3 border border-orange-200">
              <p className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                外部ブラウザで開く手順：
              </p>
              {getInstructions()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
