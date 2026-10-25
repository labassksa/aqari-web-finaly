'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/Navbar';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  FileText, Heart, Wallet, MessageCircle, Plus, UserCircle, Calendar,
} from 'lucide-react';
//sss
const NAV_ITEMS = [
  { href: '/account/my-ads',      key: 'myAds',     icon: FileText },
  { href: '/account/favorites',   key: 'favorites', icon: Heart },
  { href: '/account/wallet',      key: 'wallet',    icon: Wallet },
  { href: '/account/bookings',    key: 'bookings',  icon: Calendar },
  { href: '/account/chat',        key: 'chat',      icon: MessageCircle },
  { href: '/account/profile',     key: 'profile',   icon: UserCircle },
];

function AccountNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-e border-line bg-white min-h-[calc(100vh-64px)] py-4 px-3 gap-1">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-soft text-accent-text'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <Icon size={18} />
              {t(key as Parameters<typeof t>[0])}
            </Link>
          );
        })}

        <div className="mt-2 border-t border-line pt-2">
          <Link
            href="/add-listing"
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} /> {t('addListing')}
          </Link>
        </div>
      </aside>

      {/* ── Mobile bottom tabs ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 start-0 end-0 z-50 bg-white border-t border-line shadow-lg">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-accent-text' : 'text-muted'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {t(key as Parameters<typeof t>[0])}
              </Link>
            );
          })}
          <Link
            href="/add-listing"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-primary"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Plus size={18} className="text-white" strokeWidth={2.5} />
            </div>
            {t('add')}
          </Link>
        </div>
      </nav>
    </>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex flex-1">
          <AccountNav />
          <main className="flex-1 pb-20 lg:pb-0 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
