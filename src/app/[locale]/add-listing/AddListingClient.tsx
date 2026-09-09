'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useRouter } from '@/i18n/navigation';
import { validateListingSubmission } from '@/lib/property-types';
import { getStepList, useAddListingStore } from '@/store/add-listing.store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Step0Role from './steps/Step0Role';
import Step0aOwnerInfo from './steps/Step0aOwnerInfo';
import Step0bLicenseOwner from './steps/Step0bLicenseOwner';
import Step0cLicenseBroker from './steps/Step0cLicenseBroker';
import Step0dLicenseHost from './steps/Step0dLicenseHost';
import Step1Category from './steps/Step1Category';
import Step2Media from './steps/Step2Media';
import Step3Info from './steps/Step3Info';
import Step4Features from './steps/Step4Features';
import Step5Details from './steps/Step5Details';
import Step5bBookingSettings from './steps/Step5bBookingSettings';
import Step6Location from './steps/Step6Location';
import Step7Review from './steps/Step7Review';

const SELF_MANAGED_STEPS: (number | string)[] = ['0b', '0c', '0d', 7];

interface Props {
  presetPropertyType?: string;
  returnTarget: string;
}

function AddListingInner({ presetPropertyType }: Pick<Props, 'presetPropertyType'>) {
  const store = useAddListingStore();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('addListingFlow');
  const steps = getStepList(store.advertiserType, store.propertyType, store.listingType);
  const currentStepLabel = steps[store.currentStep] ?? steps[steps.length - 1];
  const progress = steps.length > 1 ? (store.currentStep / (steps.length - 1)) * 100 : 0;
  const showShellNext = !SELF_MANAGED_STEPS.includes(currentStepLabel);

  const handleBack = () => {
    if (store.currentStep === 0) router.push('/account/my-ads');
    else store.prevStep();
  };

  const handleNext = () => {
    const allErrors = validateListingSubmission(store);
    if (currentStepLabel === 0 && store.selectedService !== 'listing') return;
    if (currentStepLabel === 1 && !store.categoryId) return;

    if (currentStepLabel === 3) {
      const errors = Object.fromEntries(Object.entries(allErrors).filter(([key]) => ['title', 'totalPrice', 'area'].includes(key)));
      store.setValidationErrors(errors);
      if (Object.keys(errors).length) return;
    }
    if (currentStepLabel === '5b' && allErrors.minNights) {
      store.setValidationErrors({ minNights: allErrors.minNights });
      return;
    }
    if (currentStepLabel === 6) {
      const errors = Object.fromEntries(Object.entries(allErrors).filter(([key]) => ['city', 'coordinates'].includes(key)));
      store.setValidationErrors(errors);
      if (Object.keys(errors).length) return;
    }

    store.setValidationErrors({});
    store.nextStep();
  };

  const renderStep = () => {
    switch (currentStepLabel) {
      case 0: return <Step0Role />;
      case '0a': return <Step0aOwnerInfo />;
      case '0b': return <Step0bLicenseOwner />;
      case '0c': return <Step0cLicenseBroker />;
      case '0d': return <Step0dLicenseHost />;
      case 1: return <Step1Category presetPropertyType={presetPropertyType} />;
      case 2: return <Step2Media />;
      case 3: return <Step3Info />;
      case 4: return <Step4Features />;
      case 5: return <Step5Details />;
      case '5b': return <Step5bBookingSettings />;
      case 6: return <Step6Location />;
      case 7: return <Step7Review />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="flex items-center px-4 h-14 max-w-2xl mx-auto w-full">
          <button onClick={handleBack} className="p-2 rounded-xl hover:bg-gray-100" aria-label={t('back')}>
            <ChevronRight size={22} />
          </button>
          <h1 className="flex-1 text-center text-base font-bold">{t('title')}</h1>
          {currentStepLabel === 0 ? (
            <button onClick={handleNext} className="p-2 rounded-xl hover:bg-gray-100" aria-label={t('next')}>
              <ChevronLeft size={22} />
            </button>
          ) : <div className="w-10" />}
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#F5A623] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-center gap-1.5 py-2.5">
          {steps.map((step, index) => (
            <div key={String(step)} className={`rounded-full transition-all ${index < store.currentStep ? 'w-2 h-2 bg-[#F5A623]' : index === store.currentStep ? 'w-3 h-2 bg-[#F5A623]' : 'w-2 h-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto w-full">{renderStep()}</div>
      </div>

      {showShellNext && (
        <div className="fixed bottom-0 start-0 end-0 z-20 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
          <div className="flex gap-3 max-w-2xl mx-auto">
            {store.currentStep > 0 && (
              <button onClick={handleBack} className="flex-1 h-12 border border-gray-200 rounded-xl text-sm font-medium text-[#717171]">{t('back')}</button>
            )}
            <button onClick={handleNext} className={`${store.currentStep > 0 ? 'flex-1' : 'w-full'} h-12 bg-[#F5A623] text-white font-bold rounded-xl text-sm`}>
              {currentStepLabel === 6 ? t('review') : t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddListingClient(props: Props) {
  return (
    <AuthGuard returnTarget={props.returnTarget}>
      <AddListingInner presetPropertyType={props.presetPropertyType} />
    </AuthGuard>
  );
}
