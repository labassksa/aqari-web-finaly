import { create } from 'zustand';
import { emptyCategorySpecificFields, isDailyRental, type IncludedService } from '@/lib/property-types';

type AdvertiserType = 'owner' | 'agent' | 'broker' | 'host';

export function getStepList(advertiserType: AdvertiserType, propertyType?: string | null, listingType?: string | null): (number | string)[] {
  const bookingStep = isDailyRental(propertyType, listingType) ? ['5b'] : [];
  if (advertiserType === 'broker') return [0, '0c', 1, 2, 3, 4, 5, ...bookingStep, 6, 7];
  if (advertiserType === 'host') return [0, '0d', 1, 2, 3, 4, 5, ...bookingStep, 6, 7];
  return [0, '0a', '0b', 1, 2, 3, 4, 5, ...bookingStep, 6, 7];
}

export interface ListingCategorySelection {
  id: string;
  nameAr: string;
  propertyType: string;
  listingType: string;
}

interface AddListingStore {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  submitError: string | null;

  advertiserType: AdvertiserType;
  selectedService: 'listing' | 'marketing';

  // Owner/agent license
  ownershipDocumentType: string;
  ownershipDocumentNumber: string | null;
  propertyOwnerIdType: string;
  ownerNationalIdNumber: string | null;
  ownerCommercialRegNumber: string | null;
  ownerUnifiedNumber: string | null;
  propertyOwnerBirthDate: string | null;
  isHijriCalendar: boolean;
  propertyOwnerPhone: string | null;
  oneOfOwnersNationalId: string | null;
  powerOfAttorneyNumber: string | null;
  agentNationalIdNumber: string | null;
  agentBirthDate: string | null;
  agentPhone: string | null;
  skipLicenseInfo: boolean;
  licenseId: string | null;

  // Broker license
  brokerAdLicenseNumber: string | null;
  brokerOwnerIdType: string;
  brokerOwnerIdNumber: string | null;

  // Host license
  hostTourismLicenseNumber: string | null;

  // Step 1
  categoryId: string | null;
  categoryNameAr: string | null;
  propertyType: string | null;
  listingType: string | null;

  // Step 2
  uploadedUrls: string[];
  coverPhoto: string | null;
  isUploading: boolean;

  // Step 3
  title: string;
  description: string | null;
  isResidential: boolean;
  hasCommission: boolean;
  commissionPercent: number | null;
  totalPrice: number | null;
  area: number | null;

  // Step 4
  hasWater: boolean;
  hasElectricity: boolean;
  hasSewage: boolean;
  hasPrivateRoof: boolean;
  isInVilla: boolean;
  hasTwoEntrances: boolean;
  hasSpecialEntrance: boolean;

  // Step 5
  bedrooms: number | null;
  livingRooms: number | null;
  bathrooms: number | null;
  facade: string | null;
  streetWidth: number | null;
  floorNumber: number | null;
  propertyAge: number | null;
  isFurnished: boolean;
  hasKitchen: boolean;
  hasExtraUnit: boolean;
  hasCarEntrance: boolean;
  hasElevator: boolean;

  maxGuests: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  minNights: number;
  pricePerHalfDay: number | null;
  includedServices: IncludedService[];

  // Step 6
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  district: string | null;
  validationErrors: Record<string, string>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setField: (field: string, value: any) => void;
  selectCategory: (category: ListingCategorySelection) => void;
  toggleIncludedService: (service: IncludedService) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setLicenseId: (id: string) => void;
  setSubmitting: (v: boolean) => void;
  setSubmitError: (msg: string | null) => void;
  addUploadedUrl: (url: string) => void;
  removeUploadedUrl: (url: string) => void;
}

const initialState: Omit<AddListingStore, 'setField' | 'selectCategory' | 'toggleIncludedService' | 'setValidationErrors' | 'goToStep' | 'nextStep' | 'prevStep' | 'reset' | 'setLicenseId' | 'setSubmitting' | 'setSubmitError' | 'addUploadedUrl' | 'removeUploadedUrl'> = {
  currentStep: 0,
  totalSteps: 10,
  isSubmitting: false,
  submitError: null,
  advertiserType: 'owner',
  selectedService: 'listing',
  ownershipDocumentType: 'electronic_deed',
  ownershipDocumentNumber: null,
  propertyOwnerIdType: 'national_id',
  ownerNationalIdNumber: null,
  ownerCommercialRegNumber: null,
  ownerUnifiedNumber: null,
  propertyOwnerBirthDate: null,
  isHijriCalendar: false,
  propertyOwnerPhone: null,
  oneOfOwnersNationalId: null,
  powerOfAttorneyNumber: null,
  agentNationalIdNumber: null,
  agentBirthDate: null,
  agentPhone: null,
  skipLicenseInfo: false,
  licenseId: null,
  brokerAdLicenseNumber: null,
  brokerOwnerIdType: 'national_id',
  brokerOwnerIdNumber: null,
  hostTourismLicenseNumber: null,
  categoryId: null,
  categoryNameAr: null,
  propertyType: null,
  listingType: null,
  uploadedUrls: [],
  coverPhoto: null,
  isUploading: false,
  title: '',
  description: null,
  isResidential: true,
  hasCommission: false,
  commissionPercent: null,
  totalPrice: null,
  area: null,
  hasWater: false,
  hasElectricity: false,
  hasSewage: false,
  hasPrivateRoof: false,
  isInVilla: false,
  hasTwoEntrances: false,
  hasSpecialEntrance: false,
  bedrooms: null,
  livingRooms: null,
  bathrooms: null,
  facade: null,
  streetWidth: null,
  floorNumber: null,
  propertyAge: null,
  isFurnished: false,
  hasKitchen: false,
  hasExtraUnit: false,
  hasCarEntrance: false,
  hasElevator: false,
  ...emptyCategorySpecificFields(),
  address: null,
  lat: null,
  lng: null,
  city: '',
  district: null,
  validationErrors: {},
};

export const useAddListingStore = create<AddListingStore>((set, get) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  selectCategory: (category) => set({
    categoryId: category.id,
    categoryNameAr: category.nameAr,
    propertyType: category.propertyType,
    listingType: category.listingType,
    ...emptyCategorySpecificFields(),
    bedrooms: null,
    livingRooms: null,
    bathrooms: null,
    facade: null,
    streetWidth: null,
    floorNumber: null,
    propertyAge: null,
    hasWater: false,
    hasElectricity: false,
    hasSewage: false,
    hasPrivateRoof: false,
    isInVilla: false,
    hasTwoEntrances: false,
    hasSpecialEntrance: false,
    isFurnished: false,
    hasKitchen: false,
    hasExtraUnit: false,
    hasCarEntrance: false,
    hasElevator: false,
    validationErrors: {},
  }),
  toggleIncludedService: (service) => set((state) => ({
    includedServices: state.includedServices.includes(service)
      ? state.includedServices.filter((item) => item !== service)
      : [...state.includedServices, service],
  })),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  goToStep: (step) => set({ currentStep: Math.max(0, step) }),
  nextStep: () => {
    const { currentStep, advertiserType, propertyType, listingType } = get();
    const steps = getStepList(advertiserType, propertyType, listingType);
    set({ currentStep: Math.min(currentStep + 1, steps.length - 1) });
  },
  prevStep: () => {
    const { currentStep } = get();
    set({ currentStep: Math.max(0, currentStep - 1) });
  },
  reset: () => set(initialState),
  setLicenseId: (id) => set({ licenseId: id }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setSubmitError: (msg) => set({ submitError: msg }),
  addUploadedUrl: (url) =>
    set((state) => ({
      uploadedUrls: [...state.uploadedUrls, url],
      coverPhoto: state.coverPhoto ?? url,
    })),
  removeUploadedUrl: (url) =>
    set((state) => {
      const newUrls = state.uploadedUrls.filter((u) => u !== url);
      return {
        uploadedUrls: newUrls,
        coverPhoto: state.coverPhoto === url ? (newUrls[0] ?? null) : state.coverPhoto,
      };
    }),
}));
