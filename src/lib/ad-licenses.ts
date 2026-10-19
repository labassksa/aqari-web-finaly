/**
 * TEMPORARY: REGA advertising license numbers (رقم ترخيص الإعلان) shown on
 * listing pages, keyed by listing ID. Replace with a backend field once
 * license validation is integrated.
 */
const AD_LICENSE_NUMBERS: Record<string, string> = {
  'd347602b-e412-4b48-82c4-696ff0332c1d': '7201017279',
};

export function getAdLicenseNumber(listingId: string): string | undefined {
  return AD_LICENSE_NUMBERS[listingId];
}
