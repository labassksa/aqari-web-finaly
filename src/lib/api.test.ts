import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTransactions } from './api';
import { updateBookingStatus } from './booking-utils';

afterEach(() => vi.unstubAllGlobals());

describe('wallet and booking web behavior', () => {
  it('sends credit/debit as transaction type without changing referenceType', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { data: [], total: 0, page: 1, pages: 1 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getTransactions({ type: 'credit', referenceType: 'booking', page: 2, limit: 20 });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('type=credit');
    expect(url).toContain('referenceType=booking');
    expect(url).not.toContain('referenceType=credit');
  });

  it('keeps a cancelled booking card and updates its status', () => {
    const bookings = [
      { id: 'booking-1', status: 'pending', title: 'Stay' },
      { id: 'booking-2', status: 'confirmed', title: 'Other' },
    ];

    const updated = updateBookingStatus(bookings, 'booking-1', 'cancelled');

    expect(updated).toHaveLength(2);
    expect(updated[0]).toMatchObject({ id: 'booking-1', status: 'cancelled' });
    expect(updated[1]).toBe(bookings[1]);
  });
});
