'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { completeProfile } from '@/lib/auth.api';
import { KeyRound, Briefcase, BedDouble, User, Check } from 'lucide-react';

const ROLES = [
  { value: 'OWNER',  label: 'مالك / وكيل',  icon: <KeyRound  size={20} strokeWidth={1.5} /> },
  { value: 'BROKER', label: 'مسوق عقاري',   icon: <Briefcase size={20} strokeWidth={1.5} /> },
  { value: 'HOST',   label: 'مضيف',           icon: <BedDouble size={20} strokeWidth={1.5} /> },
  { value: 'USER',   label: 'مستخدم',         icon: <User      size={20} strokeWidth={1.5} /> },
] as const;

type FormValues = {
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [toast, setToast] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name:  user?.name  ?? '',
      email: user?.email ?? '',
      role:  user?.role  ?? 'USER',
    },
  });

  const selectedRole = watch('role');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function onSubmit(values: FormValues) {
    try {
      const res = await completeProfile({
        name:  values.name,
        role:  values.role,
        email: values.email || undefined,
      });
      setAuth(res.token, {
        id:           res.user.id,
        phone:        res.user.phone,
        name:         res.user.name,
        email:        values.email || null,
        profilePhoto: res.user.profilePhoto,
        role:         res.user.role,
        isVerified:   res.user.isVerified,
      });
      showToast('تم حفظ بياناتك بنجاح');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'حدث خطأ، حاول مرة أخرى');
    }
  }

  const inp = 'w-full px-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-white';
  const lbl = 'block text-sm font-medium text-ink mb-1.5';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-black text-ink mb-6">الملف الشخصي</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-2xl border border-line shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shrink-0 select-none">
          {user?.name?.charAt(0) ?? '؟'}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-ink truncate">{user?.name ?? '—'}</p>
          <p className="text-sm text-muted mt-0.5" dir="ltr">{user?.phone ?? ''}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className={lbl}>
            الاسم الكامل <span className="text-error">*</span>
          </label>
          <input
            {...register('name', {
              required: 'الاسم مطلوب',
              minLength: { value: 2, message: 'الاسم قصير جداً' },
            })}
            type="text"
            placeholder="أدخل اسمك الكامل"
            className={inp}
          />
          {errors.name && (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={lbl}>البريد الإلكتروني</label>
          <input
            {...register('email')}
            type="email"
            placeholder="اختياري"
            className={inp}
            dir="ltr"
          />
        </div>

        {/* Role */}
        <div>
          <label className={lbl}>
            أنا <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => {
              const active = selectedRole === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setValue('role', r.value, { shouldDirty: true })}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    active
                      ? 'border-primary bg-primary-soft text-accent-text'
                      : 'border-line bg-white text-muted hover:border-secondary'
                  }`}
                >
                  <span className={active ? 'text-primary' : 'text-muted'}>
                    {r.icon}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone (read-only) */}
        <div>
          <label className={lbl}>رقم الجوال</label>
          <input
            value={user?.phone ?? ''}
            readOnly
            className={`${inp} bg-surface text-muted cursor-not-allowed`}
            dir="ltr"
          />
          <p className="text-xs text-muted mt-1">لا يمكن تغيير رقم الجوال</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Check size={16} />
              حفظ التغييرات
            </>
          )}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 start-4 end-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-ink text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
