import { beforeEach, describe, expect, it } from 'vitest';
import {
  emptyCategorySpecificFields,
  findCategoryByPropertyType,
  getPropertyTypeGroup,
  sanitizeCategorySpecificFields,
  sanitizePropertyDetailFields,
  type IncludedService,
  validateListingSubmission,
} from './property-types';
import { getStepList, useAddListingStore } from '@/store/add-listing.store';

const categoryFields = {
  ...emptyCategorySpecificFields(),
  maxGuests: 20,
  checkInTime: '14:00',
  checkOutTime: '11:00',
  minNights: 2,
  pricePerHalfDay: 500,
  includedServices: ['parking', 'security'] as IncludedService[],
};

const propertyFields = {
  bedrooms: 3, livingRooms: 2, bathrooms: 2, facade: 'north', streetWidth: 20,
  floorNumber: 4, propertyAge: 5, hasWater: true, hasElectricity: true,
  hasSewage: true, hasPrivateRoof: true, isInVilla: true, hasTwoEntrances: true,
  hasSpecialEntrance: true, isFurnished: true, hasKitchen: true,
  hasExtraUnit: true, hasCarEntrance: true, hasElevator: true,
};

describe('property type behavior', () => {
  it('groups residential, commercial, land, and event hall types', () => {
    expect(getPropertyTypeGroup('apartment')).toBe('residential');
    expect(getPropertyTypeGroup('warehouse')).toBe('commercial');
    expect(getPropertyTypeGroup('land')).toBe('land');
    expect(getPropertyTypeGroup('event_hall')).toBe('event_hall');
  });

  it('finds the category used by a property-type route preset', () => {
    const categories = [
      { id: 'daily', propertyType: 'chalet' },
      { id: 'hall', propertyType: 'event_hall' },
    ];
    expect(findCategoryByPropertyType(categories, 'event_hall')?.id).toBe('hall');
    expect(findCategoryByPropertyType(categories, 'missing')).toBeUndefined();
  });

  it('adds booking step 5b only to non-event-hall short rentals', () => {
    expect(getStepList('host', 'chalet', 'rent_short')).toContain('5b');
    expect(getStepList('host', 'event_hall', 'rent_short')).not.toContain('5b');
    expect(getStepList('owner', 'apartment', 'sale')).not.toContain('5b');
  });

  it('sanitizes event-hall and daily-rental fields independently', () => {
    expect(sanitizeCategorySpecificFields('event_hall', 'rent_short', categoryFields)).toEqual({
      maxGuests: 20,
      pricePerHalfDay: 500,
      includedServices: ['parking', 'security'],
    });
    expect(sanitizeCategorySpecificFields('chalet', 'rent_short', categoryFields)).toEqual({
      maxGuests: 20,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      minNights: 2,
    });
    expect(sanitizeCategorySpecificFields('apartment', 'sale', categoryFields)).toEqual({});
  });

  it('emits only fields allowed by each property group', () => {
    expect(sanitizePropertyDetailFields('land', propertyFields)).toEqual({
      streetWidth: 20, facade: 'north', hasWater: true, hasElectricity: true, hasSewage: true,
    });
    expect(sanitizePropertyDetailFields('warehouse', propertyFields)).toEqual({
      bathrooms: 2, floor: 4, propertyAge: 5, streetWidth: 20, facade: 'north',
    });
    expect(sanitizePropertyDetailFields('event_hall', propertyFields)).toEqual({});
  });
});

describe('listing state and validation', () => {
  beforeEach(() => useAddListingStore.getState().reset());

  it('clears incompatible hidden values when category changes', () => {
    const store = useAddListingStore.getState();
    store.setField('bedrooms', 4);
    store.setField('minNights', 3);
    store.setField('pricePerHalfDay', 900);
    store.setField('includedServices', ['parking']);
    store.selectCategory({
      id: 'hall-category', nameAr: 'قاعة', propertyType: 'event_hall', listingType: 'rent_short',
    });

    const next = useAddListingStore.getState();
    expect(next.bedrooms).toBeNull();
    expect(next.minNights).toBe(1);
    expect(next.pricePerHalfDay).toBeNull();
    expect(next.includedServices).toEqual([]);
  });

  it('requires core fields, valid coordinates, and a positive minimum stay', () => {
    expect(validateListingSubmission({
      title: ' ', totalPrice: 0, area: -1, city: '', lat: 91, lng: 181,
      propertyType: 'chalet', listingType: 'rent_short', minNights: 0,
    })).toEqual({
      title: 'requiredTitle', totalPrice: 'positivePrice', area: 'positiveArea',
      city: 'requiredCity', coordinates: 'requiredCoordinates', minNights: 'invalidMinNights',
    });
  });
});
