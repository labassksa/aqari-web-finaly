'use client';
import { useAddListingStore } from '@/store/add-listing.store';
import { getPropertyTypeGroup } from '@/lib/property-types';
import { useTranslations } from 'next-intl';

const FEATURES = [
  'hasWater', 'hasElectricity', 'hasSewage', 'hasPrivateRoof',
  'isInVilla', 'hasTwoEntrances', 'hasSpecialEntrance',
] as const;

export default function Step4Features() {
  const store = useAddListingStore();
  const t = useTranslations('addListingFlow.features');
  const group = getPropertyTypeGroup(store.propertyType);
  const visibleFeatures = group === 'land'
    ? FEATURES.filter((key) => ['hasWater', 'hasElectricity', 'hasSewage'].includes(key))
    : group === 'residential'
      ? FEATURES
      : [];

  const toggle = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.setField(key, !(store as any)[key]);
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-bold text-[#222222]">{t('title')}</h2>
      <p className="text-xs text-[#717171]">{t('subtitle')}</p>

      <div className="grid grid-cols-2 gap-2">
        {visibleFeatures.map((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const checked = !!(store as any)[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                checked
                  ? 'border-[#F5A623] bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                checked ? 'bg-[#F5A623] border-[#F5A623]' : 'border-gray-300 bg-white'
              }`}>
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${checked ? 'text-[#F5A623]' : 'text-[#444444]'}`}>
                {t(`items.${key}`)}
              </span>
            </button>
          );
        })}
      </div>

      {visibleFeatures.length === 0 && (
        <p className="text-sm text-[#717171] text-center py-8">{t('none')}</p>
      )}

      <p className="text-xs text-[#717171] text-center">{t('optional')}</p>
    </div>
  );
}
