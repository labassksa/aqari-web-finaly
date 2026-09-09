'use client';
import { useEffect, useState } from 'react';
import { useAddListingStore } from '@/store/add-listing.store';
import { getCategories } from '@/lib/api';
import { useLocale, useTranslations } from 'next-intl';
import {
  Building2, Home, Landmark, Building, Store, Warehouse,
  Leaf, Coffee, Mountain, Briefcase, Layers, Tent, LayoutGrid, PartyPopper, AlertCircle,
} from 'lucide-react';
import { findCategoryByPropertyType } from '@/lib/property-types';

const PROPERTY_ICONS: Record<string, React.ReactNode> = {
  apartment:         <Building2  size={26} strokeWidth={1.5} />,
  villa:             <Home       size={26} strokeWidth={1.5} />,
  land:              <Landmark   size={26} strokeWidth={1.5} />,
  building:          <Building   size={26} strokeWidth={1.5} />,
  shop:              <Store      size={26} strokeWidth={1.5} />,
  house:             <Home       size={26} strokeWidth={1.5} />,
  rest_house:        <Coffee     size={26} strokeWidth={1.5} />,
  farm:              <Leaf       size={26} strokeWidth={1.5} />,
  chalet:            <Mountain   size={26} strokeWidth={1.5} />,
  commercial_office: <Briefcase  size={26} strokeWidth={1.5} />,
  warehouse:         <Warehouse  size={26} strokeWidth={1.5} />,
  floor:             <Layers     size={26} strokeWidth={1.5} />,
  camp:              <Tent       size={26} strokeWidth={1.5} />,
  other:             <LayoutGrid size={26} strokeWidth={1.5} />,
  event_hall:        <PartyPopper size={26} strokeWidth={1.5} />,
};

const LISTING_TYPE_STYLE: Record<string, string> = {
  sale:       'bg-blue-50 text-blue-700',
  rent_long:  'bg-emerald-50 text-emerald-700',
  rent_short: 'bg-violet-50 text-violet-700',
};

interface Category {
  id: string;
  name: string;
  nameAr: string;
  propertyType: string;
  listingType: string;
  sortOrder: number;
}

export default function Step1Category({ presetPropertyType }: { presetPropertyType?: string }) {
  const store = useAddListingStore();
  const t = useTranslations('addListingFlow.category');
  const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = () => {
    setLoading(true);
    setError('');
    return getCategories()
      .then((data) => {
        const list = data as Category[];
        const sorted = list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCategories(sorted);
        if (presetPropertyType) {
          const preset = findCategoryByPropertyType(sorted, presetPropertyType);
          if (!preset) {
            setError(t('presetUnavailable'));
            return;
          }
          if (store.propertyType !== presetPropertyType || !store.categoryId) store.selectCategory(preset);
        }
      })
      .catch(() => setError(t('loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCategories(), 0);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (cat: Category) => {
    store.selectCategory(cat);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertCircle size={42} className="text-red-400" />
        <p className="text-sm text-[#717171]">{error}</p>
        <button onClick={() => void loadCategories()} className="px-5 py-2.5 bg-[#F5A623] text-white rounded-xl text-sm font-bold">{t('retry')}</button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-base font-bold text-[#222222] mb-4">{t('title')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const selected = store.categoryId === cat.id;
          const typeStyle = LISTING_TYPE_STYLE[cat.listingType] ?? 'bg-gray-50 text-gray-600';
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-[#F5A623] bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className={selected ? 'text-[#F5A623]' : 'text-[#717171]'}>
                {PROPERTY_ICONS[cat.propertyType] ?? <LayoutGrid size={26} strokeWidth={1.5} />}
              </span>
              <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-[#F5A623]' : 'text-[#222222]'}`}>
                {locale === 'ar' ? cat.nameAr : cat.name}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeStyle}`}>
                {cat.listingType === 'sale' || cat.listingType === 'rent_long' || cat.listingType === 'rent_short'
                  ? t(`types.${cat.listingType}`)
                  : cat.listingType}
              </span>
            </button>
          );
        })}
      </div>
      {!store.categoryId && (
        <p className="text-xs text-[#717171] text-center mt-4">اختر نوع العقار للمتابعة</p>
      )}
    </div>
  );
}
