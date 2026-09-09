'use client';

import { useAddListingStore } from '@/store/add-listing.store';
import { useTranslations } from 'next-intl';

export default function Step5bBookingSettings() {
  const store = useAddListingStore();
  const t = useTranslations('addListingFlow');
  const input = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F5A623] bg-white';
  const label = 'block text-sm font-medium text-[#222222] mb-1.5';

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-[#222222]">{t('dailyRental.title')}</h2>
        <p className="text-xs text-[#717171] mt-1">{t('dailyRental.subtitle')}</p>
      </div>
      <div>
        <label className={label}>{t('dailyRental.maxGuests')}</label>
        <input type="number" min={1} value={store.maxGuests ?? ''} onChange={(event) => store.setField('maxGuests', event.target.value ? Number(event.target.value) : null)} className={input} dir="ltr" />
        {store.validationErrors.maxGuests && <p className="text-xs text-red-500 mt-1">{store.validationErrors.maxGuests}</p>}
      </div>
      <div>
        <label className={label}>{t('dailyRental.minNights')}</label>
        <input type="number" min={1} step={1} value={store.minNights} onChange={(event) => store.setField('minNights', Number(event.target.value))} className={input} dir="ltr" />
        {store.validationErrors.minNights && <p className="text-xs text-red-500 mt-1">{t('validation.invalidMinNights')}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>{t('dailyRental.checkInTime')}</label>
          <input type="time" value={store.checkInTime ?? ''} onChange={(event) => store.setField('checkInTime', event.target.value || null)} className={input} dir="ltr" />
          {store.validationErrors.checkInTime && <p className="text-xs text-red-500 mt-1">{store.validationErrors.checkInTime}</p>}
        </div>
        <div>
          <label className={label}>{t('dailyRental.checkOutTime')}</label>
          <input type="time" value={store.checkOutTime ?? ''} onChange={(event) => store.setField('checkOutTime', event.target.value || null)} className={input} dir="ltr" />
          {store.validationErrors.checkOutTime && <p className="text-xs text-red-500 mt-1">{store.validationErrors.checkOutTime}</p>}
        </div>
      </div>
    </div>
  );
}
