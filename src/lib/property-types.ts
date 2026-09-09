export const RESIDENTIAL_PROPERTY_TYPES = [
  'apartment', 'villa', 'house', 'floor', 'chalet', 'rest_house', 'farm',
] as const;

export const COMMERCIAL_PROPERTY_TYPES = [
  'shop', 'commercial_office', 'warehouse', 'building',
] as const;

export const INCLUDED_SERVICES = [
  'catering', 'sound_system', 'projector', 'decoration', 'security', 'parking',
] as const;

export type IncludedService = (typeof INCLUDED_SERVICES)[number];
export type PropertyTypeGroup = 'residential' | 'commercial' | 'land' | 'event_hall' | 'other';

export function getPropertyTypeGroup(propertyType?: string | null): PropertyTypeGroup {
  if (propertyType === 'event_hall') return 'event_hall';
  if (propertyType === 'land') return 'land';
  if ((RESIDENTIAL_PROPERTY_TYPES as readonly string[]).includes(propertyType ?? '')) return 'residential';
  if ((COMMERCIAL_PROPERTY_TYPES as readonly string[]).includes(propertyType ?? '')) return 'commercial';
  return 'other';
}

export function isEventHall(propertyType?: string | null): boolean {
  return propertyType === 'event_hall';
}

export function isDailyRental(propertyType?: string | null, listingType?: string | null): boolean {
  return listingType === 'rent_short' && !isEventHall(propertyType);
}

export function findCategoryByPropertyType<T extends { propertyType: string }>(
  categories: T[],
  propertyType?: string | null,
): T | undefined {
  if (!propertyType) return undefined;
  return categories.find((category) => category.propertyType === propertyType);
}

export interface CategorySpecificFields {
  maxGuests: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  minNights: number;
  pricePerHalfDay: number | null;
  includedServices: IncludedService[];
}

export function emptyCategorySpecificFields(): CategorySpecificFields {
  return {
    maxGuests: null,
    checkInTime: null,
    checkOutTime: null,
    minNights: 1,
    pricePerHalfDay: null,
    includedServices: [],
  };
}

export function sanitizeCategorySpecificFields(
  propertyType: string | null,
  listingType: string | null,
  fields: CategorySpecificFields,
): Record<string, unknown> {
  if (isEventHall(propertyType)) {
    return {
      maxGuests: fields.maxGuests ?? undefined,
      pricePerHalfDay: fields.pricePerHalfDay ?? undefined,
      includedServices: fields.includedServices.length ? fields.includedServices : undefined,
    };
  }
  if (isDailyRental(propertyType, listingType)) {
    return {
      maxGuests: fields.maxGuests ?? undefined,
      checkInTime: fields.checkInTime ?? undefined,
      checkOutTime: fields.checkOutTime ?? undefined,
      minNights: fields.minNights,
    };
  }
  return {};
}

export interface PropertyDetailFields {
  bedrooms: number | null;
  livingRooms: number | null;
  bathrooms: number | null;
  facade: string | null;
  streetWidth: number | null;
  floorNumber: number | null;
  propertyAge: number | null;
  hasWater: boolean;
  hasElectricity: boolean;
  hasSewage: boolean;
  hasPrivateRoof: boolean;
  isInVilla: boolean;
  hasTwoEntrances: boolean;
  hasSpecialEntrance: boolean;
  isFurnished: boolean;
  hasKitchen: boolean;
  hasExtraUnit: boolean;
  hasCarEntrance: boolean;
  hasElevator: boolean;
}

export function sanitizePropertyDetailFields(
  propertyType: string | null,
  fields: PropertyDetailFields,
): Record<string, unknown> {
  const group = getPropertyTypeGroup(propertyType);
  if (group === 'land') {
    return {
      streetWidth: fields.streetWidth ?? undefined,
      facade: fields.facade ?? undefined,
      hasWater: fields.hasWater,
      hasElectricity: fields.hasElectricity,
      hasSewage: fields.hasSewage,
    };
  }
  if (group === 'commercial') {
    return {
      bathrooms: fields.bathrooms ?? undefined,
      floor: fields.floorNumber ?? undefined,
      propertyAge: fields.propertyAge ?? undefined,
      streetWidth: fields.streetWidth ?? undefined,
      facade: fields.facade ?? undefined,
    };
  }
  if (group === 'residential') {
    return {
      bedrooms: fields.bedrooms ?? undefined,
      livingRooms: fields.livingRooms ?? undefined,
      bathrooms: fields.bathrooms ?? undefined,
      floor: fields.floorNumber ?? undefined,
      propertyAge: fields.propertyAge ?? undefined,
      streetWidth: fields.streetWidth ?? undefined,
      facade: fields.facade ?? undefined,
      hasWater: fields.hasWater,
      hasElectricity: fields.hasElectricity,
      hasSewage: fields.hasSewage,
      hasPrivateRoof: fields.hasPrivateRoof,
      isInVilla: fields.isInVilla,
      hasTwoEntrances: fields.hasTwoEntrances,
      hasSpecialEntrance: fields.hasSpecialEntrance,
      isFurnished: fields.isFurnished,
      hasKitchen: fields.hasKitchen,
      hasExtraUnit: fields.hasExtraUnit,
      hasCarEntrance: fields.hasCarEntrance,
      hasElevator: fields.hasElevator,
    };
  }
  return {};
}

export type ListingValidationField = 'title' | 'totalPrice' | 'area' | 'city' | 'coordinates' | 'minNights';

export function validateListingSubmission(input: {
  title: string;
  totalPrice: number | null;
  area: number | null;
  city: string;
  lat: number | null;
  lng: number | null;
  propertyType: string | null;
  listingType: string | null;
  minNights: number;
}): Partial<Record<ListingValidationField, string>> {
  const errors: Partial<Record<ListingValidationField, string>> = {};
  if (!input.title.trim()) errors.title = 'requiredTitle';
  if (input.totalPrice == null || !Number.isFinite(input.totalPrice) || input.totalPrice <= 0) errors.totalPrice = 'positivePrice';
  if (input.area == null || !Number.isFinite(input.area) || input.area <= 0) errors.area = 'positiveArea';
  if (!input.city) errors.city = 'requiredCity';
  if (input.lat == null || input.lng == null || !Number.isFinite(input.lat) || !Number.isFinite(input.lng) || input.lat < -90 || input.lat > 90 || input.lng < -180 || input.lng > 180) {
    errors.coordinates = 'requiredCoordinates';
  }
  if (isDailyRental(input.propertyType, input.listingType) && (!Number.isInteger(input.minNights) || input.minNights < 1)) {
    errors.minNights = 'invalidMinNights';
  }
  return errors;
}
