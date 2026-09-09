export function updateBookingStatus<T extends { id: string; status: string }>(
  bookings: T[],
  bookingId: string,
  status: string,
): T[] {
  return bookings.map((booking) => (
    booking.id === bookingId ? { ...booking, status } : booking
  ));
}
