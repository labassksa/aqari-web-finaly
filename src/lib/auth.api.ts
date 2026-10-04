import { apiRequest } from './api';

export async function sendOtp(phone: string) {
  return apiRequest<{ message: string; code?: string }>(
    '/auth/send-otp',
    { method: 'POST', body: JSON.stringify({ phone }) }
  );
}

export async function verifyOtp(phone: string, code: string) {
  return apiRequest<{
    token: string;
    isNewUser: boolean;
    user?: {
      id: string;
      phone: string;
      name: string | null;
      role: string;
      profilePhoto: string | null;
      isVerified: boolean;
    };
  }>(
    '/auth/verify-otp',
    { method: 'POST', body: JSON.stringify({ phone, code }) }
  );
}

export async function completeProfile(data: {
  name: string;
  role: string;
  email?: string;
}) {
  return apiRequest<{
    token: string;
    user: {
      id: string;
      name: string;
      role: string;
      phone: string;
      profilePhoto: string | null;
      isVerified: boolean;
    };
  }>(
    '/auth/complete-profile',
    { method: 'POST', body: JSON.stringify(data) },
    true
  );
}

export async function getMe() {
  return apiRequest<{
    id: string;
    phone: string;
    name: string | null;
    role: string;
    profilePhoto: string | null;
    isVerified: boolean;
  }>('/auth/me', {}, true);
}

/** Nafath Web login: URL of the Nafath page to send the browser to. */
export async function getNafathWebSession(lang: 'ar' | 'en' = 'ar') {
  return apiRequest<{ url: string }>(`/auth/nafath/web/session?lang=${lang}`);
}

/** Attach a Nafath-verified national ID (linkToken) to the account owning `token`. */
export async function linkNafath(linkToken: string, token: string) {
  return apiRequest<{ user: { id: string; isVerified: boolean } }>(
    '/auth/nafath/link',
    {
      method: 'POST',
      body: JSON.stringify({ linkToken }),
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
