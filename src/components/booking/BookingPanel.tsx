"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import { createBooking, createOrFindChat } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "@/i18n/navigation";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listing: any;
  onBookingSuccess: () => void;
}

export default function BookingPanel({ listing, onBookingSuccess }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore();

  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 1024px)").matches,
  );
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (listing.propertyType === 'event_hall' || listing.listingType !== 'rent_short') return null;

  const pricePerNight = parseFloat(listing.totalPrice);

  function handleBookClick() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setShowModal(true);
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createBooking({
        listingId: listing.id,
        checkInDate: checkInDate!,
        checkOutDate: checkOutDate!,
        guestCount: guestCount || undefined,
        notes: notes || undefined,
      });
      setShowModal(false);
      setIsSubmitting(false);
      setIsSuccess(true);
      onBookingSuccess();
    } catch (e) {
      setIsSubmitting(false);
      setErrorMessage(e instanceof Error ? e.message : "حدث خطأ ما");
    }
  }

  async function handleMessageHost() {
    const chat = await createOrFindChat(listing.__owner__.id, listing.id);
    router.push(`/account/chat?chatId=${chat.id}`);
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-line p-6 text-center" dir="rtl">
        <div className="text-5xl text-success mb-3">✅</div>
        <h3 className="text-lg font-bold text-ink mb-2">تم إرسال طلب الحجز</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">
          سيتم إشعارك عند تأكيد المضيف.
          <br />
          عند التأكيد سيتم حجز مبلغ الحجز
          <br />
          من رصيد محفظتك.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/account/bookings")}
            className="w-full h-12 rounded-xl border border-primary text-primary font-bold hover:bg-primary-soft transition-colors"
          >
            عرض حجوزاتي
          </button>
          <button
            onClick={handleMessageHost}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
          >
            محادثة المضيف
          </button>
        </div>
      </div>
    );
  }

  const panelBody = (
    <>
      {/* Price header */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold text-ink">
          {pricePerNight.toLocaleString("ar-SA")} ريال
        </span>
        <span className="text-sm text-hint">/ ليلة</span>
      </div>

      {/* Calendar */}
      <AvailabilityCalendar
        listingId={listing.id}
        totalPricePerNight={pricePerNight}
        minNights={listing.minNights ?? 1}
        onSelectionChange={(s) => {
          setCheckInDate(s.checkInDate);
          setCheckOutDate(s.checkOutDate);
          setNights(s.nights);
          setTotalPrice(s.totalPrice);
        }}
      />

      {/* Booking summary */}
      {checkInDate && checkOutDate && (
        <div className="bg-surface rounded-xl p-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">تسجيل الوصول</span>
            <span className="text-ink font-medium">
              {format(new Date(checkInDate), "dd MMM yyyy", { locale: arSA })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">تسجيل المغادرة</span>
            <span className="text-ink font-medium">
              {format(new Date(checkOutDate), "dd MMM yyyy", { locale: arSA })}
            </span>
          </div>
          <hr className="border-line" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-ink">المجموع</span>
            <span className="text-ink">{totalPrice.toLocaleString()} ريال</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBookClick}
        disabled={!checkInDate || !checkOutDate || isSubmitting}
        className="w-full h-12 rounded-xl bg-primary text-white font-bold mt-4 hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          "احجز الآن"
        )}
      </button>

      <p className="text-xs text-hint text-center mt-3 leading-relaxed">
        لا يتم الدفع الآن — سيتم حجز المبلغ
        <br />
        من محفظتك عند تأكيد المضيف
      </p>
    </>
  );

  return (
    <>
      {isDesktop ? (
        <div className="bg-white rounded-2xl shadow-lg border border-line p-6" dir="rtl">
          {panelBody}
        </div>
      ) : (
        <>
          {/* Mobile sticky bar — tap anywhere to open the full booking sheet */}
          <button
            onClick={() => setShowSheet(true)}
            className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line shadow-lg px-4 py-3 flex items-center justify-between"
            dir="ltr"
          >
            <span className="text-sm font-bold text-ink" dir="rtl">
              {pricePerNight.toLocaleString("ar-SA")} ريال <span className="font-normal text-hint">/ ليلة</span>
            </span>
            <span className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              احجز الآن
            </span>
          </button>

          {/* Mobile bottom sheet */}
          {showSheet && (
            <div
              className="fixed inset-0 z-40 bg-black/50 flex items-end"
              onClick={() => setShowSheet(false)}
            >
              <div
                className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-6 pb-8"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1.5 bg-line rounded-full mx-auto mb-4" />
                {panelBody}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <h3 className="text-lg font-bold text-ink mb-4">تأكيد الحجز</h3>

            <div className="space-y-1.5 text-sm mb-4">
              <p className="font-bold text-ink">{listing.title}</p>
              <div className="flex justify-between text-muted">
                <span>تسجيل الوصول</span>
                <span>
                  {checkInDate && format(new Date(checkInDate), "dd MMM yyyy", { locale: arSA })}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>تسجيل المغادرة</span>
                <span>
                  {checkOutDate && format(new Date(checkOutDate), "dd MMM yyyy", { locale: arSA })}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>عدد الليالي</span>
                <span>{nights}</span>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <span>المجموع</span>
                <span>{totalPrice.toLocaleString()} ريال</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-muted mb-1">عدد الضيوف</label>
              <input
                type="number"
                min={1}
                max={listing.maxGuests ?? undefined}
                value={guestCount ?? ""}
                onChange={(e) => setGuestCount(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
              />
              {listing.maxGuests && (
                <p className="text-xs text-hint mt-1">الحد الأقصى {listing.maxGuests} ضيف</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-muted mb-1">ملاحظات للمضيف</label>
              <textarea
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي طلبات خاصة..."
                rows={3}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="bg-primary-soft border border-primary rounded-xl p-3 text-xs text-ink leading-relaxed">
              سيتم حجز مبلغ الحجز من محفظتك
              <br />
              فقط بعد تأكيد المضيف للطلب
            </div>

            {errorMessage && <p className="text-sm text-error mt-2">{errorMessage}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage(null);
                }}
                className="flex-1 h-11 rounded-xl border border-line text-muted font-medium hover:bg-surface transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  "تأكيد الطلب"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
