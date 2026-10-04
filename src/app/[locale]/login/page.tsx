'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { sendOtp, getNafathWebSession } from '@/lib/auth.api';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const ARAB_COUNTRIES = [
  { code: '+966', flag: '🇸🇦', nameAr: 'السعودية',   min: 9, max: 9  },
  { code: '+971', flag: '🇦🇪', nameAr: 'الإمارات',   min: 9, max: 9  },
  { code: '+965', flag: '🇰🇼', nameAr: 'الكويت',     min: 8, max: 8  },
  { code: '+974', flag: '🇶🇦', nameAr: 'قطر',        min: 8, max: 8  },
  { code: '+973', flag: '🇧🇭', nameAr: 'البحرين',    min: 8, max: 8  },
  { code: '+968', flag: '🇴🇲', nameAr: 'عُمان',      min: 8, max: 8  },
  { code: '+962', flag: '🇯🇴', nameAr: 'الأردن',     min: 9, max: 9  },
  { code: '+20',  flag: '🇪🇬', nameAr: 'مصر',        min: 10, max: 10 },
  { code: '+964', flag: '🇮🇶', nameAr: 'العراق',     min: 10, max: 10 },
  { code: '+961', flag: '🇱🇧', nameAr: 'لبنان',      min: 7,  max: 8  },
  { code: '+970', flag: '🇵🇸', nameAr: 'فلسطين',    min: 9,  max: 9  },
  { code: '+963', flag: '🇸🇾', nameAr: 'سوريا',      min: 9,  max: 9  },
  { code: '+967', flag: '🇾🇪', nameAr: 'اليمن',      min: 9,  max: 9  },
  { code: '+249', flag: '🇸🇩', nameAr: 'السودان',    min: 9,  max: 9  },
  { code: '+218', flag: '🇱🇾', nameAr: 'ليبيا',      min: 9,  max: 9  },
  { code: '+216', flag: '🇹🇳', nameAr: 'تونس',       min: 8,  max: 8  },
  { code: '+213', flag: '🇩🇿', nameAr: 'الجزائر',    min: 9,  max: 9  },
  { code: '+212', flag: '🇲🇦', nameAr: 'المغرب',     min: 9,  max: 9  },
  { code: '+222', flag: '🇲🇷', nameAr: 'موريتانيا',  min: 8,  max: 8  },
  { code: '+252', flag: '🇸🇴', nameAr: 'الصومال',    min: 7,  max: 8  },
  { code: '+253', flag: '🇩🇯', nameAr: 'جيبوتي',     min: 8,  max: 8  },
  { code: '+269', flag: '🇰🇲', nameAr: 'جزر القمر',  min: 7,  max: 7  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(ARAB_COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nafathLoading, setNafathLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nafathLinkPending = searchParams.get('nafath') === 'link';

  async function loginWithNafath() {
    setError('');
    setNafathLoading(true);
    try {
      const redirect = searchParams.get('redirect');
      if (redirect) sessionStorage.setItem('aqar_nafath_redirect', redirect);
      const { url } = await getNafathWebSession('ar');
      window.location.assign(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر الاتصال بنفاذ، حاول مرة أخرى');
      setNafathLoading(false);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectCountry(c: typeof ARAB_COUNTRIES[0]) {
    setSelected(c);
    setPhone('');
    setDropdownOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length < selected.min || digits.length > selected.max) {
      setError(`أدخل رقم جوال صحيح (${selected.min === selected.max ? selected.min : `${selected.min}-${selected.max}`} أرقام)`);
      return;
    }

    const fullPhone = selected.code + digits;
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      sessionStorage.setItem('aqar_otp_phone', fullPhone);
      const redirect = searchParams.get('redirect');
      router.push(`/otp${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-black text-[#F5A623]">أقورا</span>
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#222222]">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-[#717171]">أدخل رقم جوالك للمتابعة</p>
        </div>

        {nafathLinkPending && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 text-center">
            تم التحقق من هويتك عبر نفاذ. أدخل رقم جوالك لمرة واحدة فقط لربط هويتك بحسابك.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#222222] mb-1.5">
              رقم الجوال
            </label>

            <div className="flex items-stretch border border-gray-200 rounded-xl overflow-visible focus-within:border-[#F5A623] transition-colors" dir="ltr">
              {/* Country code picker */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 h-full bg-gray-50 border-r border-gray-200 text-sm text-[#222222] hover:bg-gray-100 transition-colors rounded-l-xl"
                >
                  <span className="text-base leading-none">{selected.flag}</span>
                  <span className="font-medium">{selected.code}</span>
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                    {ARAB_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => selectCountry(c)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-right hover:bg-gray-50 transition-colors ${
                          selected.code === c.code ? 'bg-orange-50 text-[#F5A623] font-medium' : 'text-[#222222]'
                        }`}
                        dir="rtl"
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="flex-1 text-right">{c.nameAr}</span>
                        <span className="text-[#717171] text-xs font-mono" dir="ltr">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone number input */}
              <input
                type="tel"
                inputMode="numeric"
                maxLength={selected.max}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, selected.max))}
                placeholder={'X'.repeat(selected.min)}
                className="flex-1 px-3 py-3 text-sm outline-none bg-white rounded-r-xl"
                autoComplete="tel-national"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#F5A623] hover:bg-[#E09400] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال رمز التحقق'
            )}
          </button>
        </form>

        {!nafathLinkPending && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-[#717171]">
              <span className="h-px flex-1 bg-gray-200" />
              أو
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={loginWithNafath}
              disabled={nafathLoading}
              className="w-full h-12 border border-[#11998E] text-[#11998E] hover:bg-[#11998E]/5 disabled:opacity-60 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {nafathLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#11998E] border-t-transparent" />
                  جاري التحويل إلى نفاذ...
                </>
              ) : (
                'الدخول عبر نفاذ'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
