'use client';
import { useState } from 'react';
import { useAddListingStore } from '@/store/add-listing.store';
import { useAuthStore } from '@/store/auth.store';

const DOC_TYPES = [
  { value: 'electronic_deed', label: 'صك إلكتروني/سجل عيني' },
  { value: 'other', label: 'غير ذلك' },
];

const ID_TYPES = [
  { value: 'national_id', label: 'هوية وطنية' },
  { value: 'commercial_registration', label: 'سجل تجاري' },
  { value: 'unified_700', label: 'رقم موحد 700' },
];

interface ConfirmModal {
  open: boolean;
}

export default function Step0bLicenseOwner() {
  const store = useAddListingStore();
  const { user } = useAuthStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<ConfirmModal>({ open: false });

  const inp = 'w-full px-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white';
  const lbl = 'block text-sm font-medium text-ink mb-1.5';

  const handleIdTypeChange = (val: string) => {
    store.setField('propertyOwnerIdType', val);
    store.setField('ownerNationalIdNumber', null);
    store.setField('ownerCommercialRegNumber', null);
    store.setField('ownerUnifiedNumber', null);
    store.setField('propertyOwnerBirthDate', null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!store.ownershipDocumentNumber) errs.ownershipDocumentNumber = 'مطلوب';
    if (store.propertyOwnerIdType === 'national_id' && !store.ownerNationalIdNumber) errs.ownerNationalIdNumber = 'مطلوب';
    if (store.propertyOwnerIdType === 'national_id' && !store.propertyOwnerBirthDate) errs.propertyOwnerBirthDate = 'مطلوب';
    if (store.propertyOwnerIdType === 'commercial_registration' && !store.ownerCommercialRegNumber) errs.ownerCommercialRegNumber = 'مطلوب';
    if (store.propertyOwnerIdType === 'unified_700' && !store.ownerUnifiedNumber) errs.ownerUnifiedNumber = 'مطلوب';
    if (store.advertiserType === 'agent') {
      if (!store.powerOfAttorneyNumber) errs.powerOfAttorneyNumber = 'مطلوب';
      if (!store.agentNationalIdNumber) errs.agentNationalIdNumber = 'مطلوب';
      if (!store.agentBirthDate) errs.agentBirthDate = 'مطلوب';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) store.nextStep();
  };

  const handleSkipConfirm = () => {
    store.setField('skipLicenseInfo', true);
    store.nextStep();
    setConfirm({ open: false });
  };

  return (
    <div className="px-4 py-6 space-y-5 pb-36">
      {/* Document type */}
      <div>
        <p className={lbl}>نوع الصك</p>
        <div className="flex gap-2">
          {DOC_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => store.setField('ownershipDocumentType', t.value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                store.ownershipDocumentType === t.value
                  ? 'border-primary bg-primary-soft text-accent-text'
                  : 'border-line bg-white text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Owner ID type */}
      <div>
        <p className={lbl}>نوع هوية المالك <span className="text-error">*</span></p>
        <div className="flex gap-2">
          {ID_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleIdTypeChange(t.value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-[11px] font-medium transition-all leading-tight ${
                store.propertyOwnerIdType === t.value
                  ? 'border-primary bg-primary-soft text-accent-text'
                  : 'border-line bg-white text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic ID field */}
      {store.propertyOwnerIdType === 'national_id' && (
        <>
          <div>
            <label className={lbl}>رقم الهوية الوطنية للمالك <span className="text-error">*</span></label>
            <input
              value={store.ownerNationalIdNumber ?? ''}
              onChange={(e) => store.setField('ownerNationalIdNumber', e.target.value)}
              className={inp}
              placeholder="10 أرقام"
              dir="ltr"
            />
            {errors.ownerNationalIdNumber && <p className="text-error text-xs mt-1">{errors.ownerNationalIdNumber}</p>}
          </div>
          <div>
            <label className={lbl}>تاريخ ميلاد المالك <span className="text-error">*</span></label>
            <div className="flex gap-3">
              <input
                type="date"
                value={store.propertyOwnerBirthDate ?? ''}
                onChange={(e) => store.setField('propertyOwnerBirthDate', e.target.value)}
                className={`${inp} flex-1`}
                dir="ltr"
              />
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={store.isHijriCalendar}
                  onChange={(e) => store.setField('isHijriCalendar', e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-muted">هجري</span>
              </label>
            </div>
            {errors.propertyOwnerBirthDate && <p className="text-error text-xs mt-1">{errors.propertyOwnerBirthDate}</p>}
          </div>
          <div>
            <label className={lbl}>رقم جوال المالك</label>
            <input
              value={store.propertyOwnerPhone ?? user?.phone ?? ''}
              onChange={(e) => store.setField('propertyOwnerPhone', e.target.value)}
              className={inp}
              placeholder="+966XXXXXXXXX"
              dir="ltr"
            />
          </div>
        </>
      )}

      {store.propertyOwnerIdType === 'commercial_registration' && (
        <div>
          <label className={lbl}>رقم السجل التجاري للمنشأة <span className="text-error">*</span></label>
          <input
            value={store.ownerCommercialRegNumber ?? ''}
            onChange={(e) => store.setField('ownerCommercialRegNumber', e.target.value)}
            className={inp}
            dir="ltr"
          />
          {errors.ownerCommercialRegNumber && <p className="text-error text-xs mt-1">{errors.ownerCommercialRegNumber}</p>}
        </div>
      )}

      {store.propertyOwnerIdType === 'unified_700' && (
        <div>
          <label className={lbl}>الرقم الموحد 700 للمنشأة <span className="text-error">*</span></label>
          <input
            value={store.ownerUnifiedNumber ?? ''}
            onChange={(e) => store.setField('ownerUnifiedNumber', e.target.value)}
            className={inp}
            dir="ltr"
          />
          {errors.ownerUnifiedNumber && <p className="text-error text-xs mt-1">{errors.ownerUnifiedNumber}</p>}
        </div>
      )}

      {/* Deed number (always) */}
      <div>
        <label className={lbl}>رقم الصك أو رقم العقار أو رقم السجل العيني <span className="text-error">*</span></label>
        <input
          value={store.ownershipDocumentNumber ?? ''}
          onChange={(e) => store.setField('ownershipDocumentNumber', e.target.value)}
          className={inp}
          dir="ltr"
        />
        {errors.ownershipDocumentNumber && <p className="text-error text-xs mt-1">{errors.ownershipDocumentNumber}</p>}
      </div>

      {/* Multiple owners */}
      <div>
        <label className={lbl}>رقم هوية أحد الملاك</label>
        <p className="text-xs text-muted mb-1.5">في حال وجود ملاك متعددين</p>
        <input
          value={store.oneOfOwnersNationalId ?? ''}
          onChange={(e) => store.setField('oneOfOwnersNationalId', e.target.value)}
          className={inp}
          dir="ltr"
          placeholder="اختياري"
        />
      </div>

      {/* Agent fields */}
      {store.advertiserType === 'agent' && (
        <div className="border border-secondary/60 bg-primary-soft rounded-2xl p-4 space-y-4">
          <p className="text-sm font-semibold text-primary">بيانات الوكيل</p>
          <div>
            <label className={lbl}>رقم الوكالة الرسمية <span className="text-error">*</span></label>
            <input
              value={store.powerOfAttorneyNumber ?? ''}
              onChange={(e) => store.setField('powerOfAttorneyNumber', e.target.value)}
              className={inp}
              dir="ltr"
            />
            {errors.powerOfAttorneyNumber && <p className="text-error text-xs mt-1">{errors.powerOfAttorneyNumber}</p>}
          </div>
          <div>
            <label className={lbl}>رقم الهوية الوطنية للوكيل <span className="text-error">*</span></label>
            <input
              value={store.agentNationalIdNumber ?? ''}
              onChange={(e) => store.setField('agentNationalIdNumber', e.target.value)}
              className={inp}
              dir="ltr"
            />
            {errors.agentNationalIdNumber && <p className="text-error text-xs mt-1">{errors.agentNationalIdNumber}</p>}
          </div>
          <div>
            <label className={lbl}>تاريخ ميلاد الوكيل <span className="text-error">*</span></label>
            <input
              type="date"
              value={store.agentBirthDate ?? ''}
              onChange={(e) => store.setField('agentBirthDate', e.target.value)}
              className={inp}
              dir="ltr"
            />
            {errors.agentBirthDate && <p className="text-error text-xs mt-1">{errors.agentBirthDate}</p>}
          </div>
          <div>
            <label className={lbl}>رقم جوال الوكيل</label>
            <input
              value={store.agentPhone ?? user?.phone ?? ''}
              onChange={(e) => store.setField('agentPhone', e.target.value)}
              className={inp}
              placeholder="+966XXXXXXXXX"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Bottom buttons (self-managed) */}
      <div className="fixed bottom-0 start-0 end-0 z-20 bg-white border-t border-line px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          <button
            onClick={handleContinue}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm transition-colors"
          >
            استمرار
          </button>
          <button
            onClick={() => setConfirm({ open: true })}
            className="w-full h-11 text-muted text-sm font-medium hover:text-ink transition-colors"
          >
            إدخال البيانات لاحقاً
          </button>
        </div>
      </div>

      {/* Confirm skip modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-ink mb-2">تخطي بيانات الترخيص؟</h3>
            <p className="text-sm text-muted mb-6">
              لن يتم نشر إعلانك حتى تكتمل بيانات الترخيص.
              سيتم حفظ إعلانك كمسودة.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ open: false })}
                className="flex-1 py-2.5 border border-line rounded-xl text-sm font-medium text-muted"
              >
                إلغاء
              </button>
              <button
                onClick={handleSkipConfirm}
                className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold text-white"
              >
                تخطي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
