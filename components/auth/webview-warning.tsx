'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * WebView検出と警告表示コンポーネント
 * Google OAuthはWebView（アプリ内ブラウザ）を許可していないため、
 * 外部ブラウザで開くよう促す
 */
export function WebViewWarning() {
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    // WebViewを検出
    const userAgent = navigator.userAgent.toLowerCase();
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
      userAgent.includes('line/') ||
      userAgent.includes('twitter') ||
      userAgent.includes('instagram');

    setIsWebView(isWebViewDetected);
  }, []);

  if (!isWebView) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-1">
              Googleアカウントでサインインするには
            </h3>
            <p className="text-sm text-orange-800 mb-3">
              アプリ内ブラウザではGoogleアカウントでのサインインができません。
              右上のメニューから「ブラウザで開く」を選択して、SafariやChromeなどの標準ブラウザで開いてください。
            </p>
            <div className="text-xs text-orange-700 space-y-1">
              <p>• iOS: 右上の「...」→「Safariで開く」</p>
              <p>• Android: 右上の「...」→「Chromeで開く」または「ブラウザで開く」</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
