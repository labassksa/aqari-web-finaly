'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { MoreVertical, ExternalLink, PauseCircle, Trash2, Plus, AlertCircle } from 'lucide-react';
import { getMyListings, patchListingStatus, deleteListing } from '@/lib/api';
import { formatPrice, formatAdNumber } from '@/lib/format';

const STATUS_TABS = [
  { label: 'الكل',           value: '' },
  { label: 'منشور',          value: 'published' },
  { label: 'قيد المراجعة',  value: 'pending' },
  { label: 'موقوف',          value: 'paused' },
  { label: 'مسودة',          value: 'draft' },
  { label: 'منتهي',          value: 'expired' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  published:   { label: 'منشور',         className: 'bg-success-soft text-success' },
  pending:     { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-700' },
  paused_temp: { label: 'موقوف مؤقتاً', className: 'bg-primary-soft text-accent-text' },
  paused:      { label: 'موقوف',         className: 'bg-primary-soft text-accent-text' },
  draft:       { label: 'مسودة',         className: 'bg-surface text-muted' },
  expired:     { label: 'منتهي',         className: 'bg-error-soft text-error' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MyListing = any;

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function MyAdsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, title: '', message: '', onConfirm: () => {} });
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyListings({ status: status || undefined, limit: 50 });
      setListings((res.data as MyListing[]) ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(activeTab), 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function askConfirm(title: string, message: string, onConfirm: () => void) {
    setConfirm({ open: true, title, message, onConfirm });
    setOpenMenu(null);
  }

  async function handlePause(id: string) {
    askConfirm('إيقاف مؤقت', 'هل تريد إيقاف هذا الإعلان مؤقتاً؟', async () => {
      setConfirm((c) => ({ ...c, open: false }));
      try {
        await patchListingStatus(id, 'paused_temp');
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'paused_temp' } : l));
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : 'حدث خطأ');
      }
    });
  }

  async function handleDelete(id: string) {
    askConfirm('حذف الإعلان', 'هل تريد حذف هذا الإعلان نهائياً؟ لا يمكن التراجع عن هذا الإجراء.', async () => {
      setConfirm((c) => ({ ...c, open: false }));
      try {
        await deleteListing(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : 'حدث خطأ');
      }
    });
  }

  const coverOf = (l: MyListing): string | null =>
    l.coverPhoto ?? l.__media__?.[0]?.url ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-ink">إعلاناتي</h1>
        <Link
          href="/add-listing"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> إضافة إعلان جديد
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeTab === t.value
                ? 'bg-primary border-primary text-white'
                : 'border-line text-muted hover:border-secondary bg-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-error text-sm bg-error-soft rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4">
              <div className="w-[120px] h-[80px] rounded-lg bg-line shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-line rounded w-24" />
                <div className="h-4 bg-line rounded w-3/4" />
                <div className="h-3 bg-line rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-6xl">📋</span>
          <h3 className="text-xl font-bold text-ink">لا توجد إعلانات</h3>
          <p className="text-muted text-sm">
            {activeTab ? 'لا توجد إعلانات بهذه الحالة' : 'لم تضف أي إعلان بعد'}
          </p>
          <Link
            href="/add-listing"
            className="mt-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            أضف إعلانك الأول
          </Link>
        </div>
      )}

      {/* Listing rows */}
      {!loading && !error && listings.length > 0 && (
        <div className="space-y-3" ref={menuRef}>
          {listings.map((listing: MyListing) => {
            const statusCfg = STATUS_CONFIG[listing.status] ?? { label: listing.status, className: 'bg-surface text-muted' };
            const cover = coverOf(listing);
            const isDraft = listing.status === 'draft';

            return (
              <div
                key={listing.id}
                className={`relative bg-white rounded-2xl shadow-sm ${
                  openMenu === listing.id ? 'z-20 overflow-visible' : 'z-0 overflow-hidden'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Cover photo */}
                  <div className="relative w-[120px] h-[80px] rounded-lg overflow-hidden bg-surface shrink-0">
                    {cover ? (
                      <Image src={cover} alt={listing.title ?? ''} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-hint">🏠</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {listing.adNumber && (
                      <p className="text-[11px] text-hint mb-0.5">{formatAdNumber(listing.adNumber)}</p>
                    )}
                    <p className="font-bold text-ink text-sm leading-snug line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {listing.city}{listing.category ? ` · ${listing.category?.nameAr ?? listing.category}` : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-black text-primary">
                        {formatPrice(String(listing.totalPrice ?? listing.price ?? 0))}
                      </span>
                      {listing.area && (
                        <span className="text-xs text-muted">
                          {parseFloat(String(listing.area))} م²
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + menu */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                        className="p-1.5 rounded-lg hover:bg-surface text-hint transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === listing.id && (
                        <div className="absolute end-0 top-8 w-44 bg-white border border-line rounded-xl shadow-lg z-10 py-1" dir="rtl">
                          <a
                            href={`/listings/${listing.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface"
                            onClick={() => setOpenMenu(null)}
                          >
                            <ExternalLink size={14} /> عرض الإعلان
                          </a>
                          {listing.status === 'published' && (
                            <button
                              onClick={() => handlePause(listing.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-accent-text hover:bg-primary-soft"
                            >
                              <PauseCircle size={14} /> إيقاف مؤقت
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-soft"
                          >
                            <Trash2 size={14} /> حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Draft warning banner */}
                {isDraft && (
                  <div className="border-t border-secondary/40 bg-primary-soft px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-accent-text flex items-center gap-1.5">
                      <span>⚠️</span>
                      أكمل بيانات الترخيص لنشر هذا الإعلان
                    </p>
                    <Link
                      href={`/account/complete-license?listingId=${listing.id}`}
                      className="shrink-0 text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary-soft transition-colors"
                    >
                      إكمال الترخيص
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-ink mb-2">{confirm.title}</h3>
            <p className="text-sm text-muted mb-6">{confirm.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm((c) => ({ ...c, open: false }))}
                className="flex-1 py-2.5 border border-line rounded-xl text-sm font-medium text-muted hover:bg-surface transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirm.onConfirm}
                className="flex-1 py-2.5 bg-error hover:bg-error/90 rounded-xl text-sm font-bold text-white transition-colors"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
