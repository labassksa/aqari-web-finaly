'use client';

import { INCLUDED_SERVICES, getPropertyTypeGroup } from '@/lib/property-types';
import { useAddListingStore } from '@/store/add-listing.store';
import { useTranslations } from 'next-intl';

const FACADE_OPTIONS = [
  'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest',
] as const;

const DETAIL_KEYS = {
  residential: [
    ['bedrooms'], ['livingRooms'], ['bathrooms'], ['floorNumber'],
    ['propertyAge', 'years'], ['streetWidth', 'meters'],
  ],
  commercial: [
    ['bathrooms'], ['floorNumber'], ['propertyAge', 'years'], ['streetWidth', 'meters'],
  ],
  land: [['streetWidth', 'meters']],
} as const;

const RESIDENTIAL_FEATURES = [
  'isFurnished', 'hasKitchen', 'hasExtraUnit', 'hasCarEntrance', 'hasElevator',
] as const;

export default function Step5Details() {
  const store = useAddListingStore();
  const t = useTranslations('addListingFlow');
  const group = getPropertyTypeGroup(store.propertyType);
  const input = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F5A623] bg-white';

  if (group === 'event_hall') {
    return (
      <div className="px-4 py-6 space-y-5">
        <h2 className="text-base font-bold text-[#222222]">{t('details.eventHall.title')}</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('details.eventHall.capacity')}</label>
          <input type="number" min={1} value={store.maxGuests ?? ''} onChange={(event) => store.setField('maxGuests', event.target.value ? Number(event.target.value) : null)} className={input} dir="ltr" />
          {store.validationErrors.maxGuests && <p className="text-xs text-red-500 mt-1">{store.validationErrors.maxGuests}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('details.eventHall.halfDayPrice')}</label>
          <input type="number" min={0} value={store.pricePerHalfDay ?? ''} onChange={(event) => store.setField('pricePerHalfDay', event.target.value ? Number(event.target.value) : null)} className={input} dir="ltr" />
          <p className="text-xs text-[#717171] mt-1">{t('details.eventHall.halfDayHint')}</p>
          {store.validationErrors.pricePerHalfDay && <p className="text-xs text-red-500 mt-1">{store.validationErrors.pricePerHalfDay}</p>}
        </div>
        <div>
          <p className="text-sm font-medium mb-2">{t('details.eventHall.services')}</p>
          <div className="grid grid-cols-2 gap-2">
            {INCLUDED_SERVICES.map((service) => {
              const checked = store.includedServices.includes(service);
              return (
                <button key={service} type="button" onClick={() => store.toggleIncludedService(service)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm ${checked ? 'border-[#F5A623] bg-orange-50 text-[#F5A623]' : 'border-gray-200 bg-white'}`}>
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checked ? 'bg-[#F5A623] border-[#F5A623] text-white' : 'border-gray-300'}`}>{checked ? '✓' : ''}</span>
                  {t(`services.${service}`)}
                </button>
              );
            })}
          </div>
          {store.validationErrors.includedServices && <p className="text-xs text-red-500 mt-1">{store.validationErrors.includedServices}</p>}
        </div>
      </div>
    );
  }

  const numberFields = group === 'residential' || group === 'commercial' || group === 'land'
    ? DETAIL_KEYS[group]
    : [];
  const showFacade = group === 'residential' || group === 'commercial' || group === 'land';

  return (
    <div className="px-4 py-6 space-y-5">
      <h2 className="text-base font-bold text-[#222222]">{t('details.title')}</h2>
      {numberFields.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {numberFields.map(([key, unit]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#717171] mb-1">{t(`details.${key}`)}{unit ? ` (${t(`details.${unit}`)})` : ''}</label>
              <input value={String(store[key as keyof typeof store] ?? '')} onChange={(event) => store.setField(key, event.target.value ? Number(event.target.value) : null)} className={input} dir="ltr" type="number" min={0} placeholder="0" />
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-[#717171]">{t('details.noExtra')}</p>}

      {showFacade && (
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('details.facade')}</label>
          <select value={store.facade ?? ''} onChange={(event) => store.setField('facade', event.target.value || null)} className={input}>
            <option value="">{t('details.selectFacade')}</option>
            {FACADE_OPTIONS.map((facade) => <option key={facade} value={facade}>{t(`details.facades.${facade}`)}</option>)}
          </select>
        </div>
      )}

      {group === 'residential' && (
        <div>
          <p className="text-sm font-medium mb-2">{t('details.residentialFeatures')}</p>
          <div className="grid grid-cols-2 gap-2">
            {RESIDENTIAL_FEATURES.map((key) => {
              const checked = Boolean(store[key]);
              return <button key={key} type="button" onClick={() => store.setField(key, !checked)} className={`p-3 rounded-xl border-2 text-sm ${checked ? 'border-[#F5A623] bg-orange-50 text-[#F5A623]' : 'border-gray-200 bg-white'}`}>{t(`details.features.${key}`)}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
