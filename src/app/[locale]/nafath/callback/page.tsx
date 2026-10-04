'use client';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { getMe } from '@/lib/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { connectChatSocket } from '@/lib/socket';

const ERROR_MESSAGES: Record<string, string> = {
  NAFATH_DISABLED: 'الدخول عبر نفاذ غير متاح حالياً.',
  NAFATH_UNAVAILABLE: 'تعذر التحقق عبر نفاذ، حاول مرة أخرى.',
  NAFATH_INVALID_CALLBACK: 'تعذر التحقق من بيانات نفاذ، حاول مرة أخرى.',
  NAFATH_ACCOUNT_INACTIVE: 'هذا الحساب غير مفعل.',
};

function safeRedirect(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}

/**
 * Nafath Web login lands here. The backend puts the outcome in the URL
 * fragment (never sent to servers): #token=… | #linkToken=… | #error=CODE
 */
export default function NafathCallbackPage() {
  const router = useRouter();
  const { setToken, setUser, logout } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    // Drop the token from the address bar / history right away.
    window.history.replaceState(null, '', window.location.pathname);

    const token = params.get('token');
    const linkToken = params.get('linkToken');
    const errorCode = params.get('error');
    const redirect = safeRedirect(sessionStorage.getItem('aqar_nafath_redirect'));

    if (token) {
      setToken(token);
      getMe()
        .then((me) => {
          setUser({ ...me, email: null });
          connectChatSocket();
          sessionStorage.removeItem('aqar_nafath_redirect');
          router.replace(redirect);
        })
        .catch(() => {
          logout();
          setError(ERROR_MESSAGES.NAFATH_UNAVAILABLE);
        });
      return;
    }

    if (linkToken) {
      // First Nafath login for this ID: verify the phone once, then link (see OTP page).
      sessionStorage.setItem('aqar_nafath_link', linkToken);
      const keep = redirect !== '/' ? `&redirect=${encodeURIComponent(redirect)}` : '';
      router.replace(`/login?nafath=link${keep}`);
      return;
    }

    const timer = window.setTimeout(() =>
      setError(
        ERROR_MESSAGES[errorCode ?? ''] ?? ERROR_MESSAGES.NAFATH_UNAVAILABLE,
      ),
    );
    return () => window.clearTimeout(timer);
  }, [router, setToken, setUser, logout]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-4xl font-black text-[#F5A623]">أقورا</span>
        {error ? (
          <>
            <p className="mt-6 text-red-500 text-sm">{error}</p>
            <button
              onClick={() => router.replace('/login')}
              className="mt-6 w-full h-12 bg-[#F5A623] hover:bg-[#E09400] text-white font-semibold rounded-xl transition-colors"
            >
              العودة لتسجيل الدخول
            </button>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-[#717171]">
            <span className="animate-spin rounded-full h-6 w-6 border-2 border-[#F5A623] border-t-transparent" />
            جاري إكمال الدخول عبر نفاذ...
          </div>
        )}
      </div>
    </div>
  );
}
