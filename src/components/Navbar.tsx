"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Building2,
  CalendarDays,
  PartyPopper,
  Info,
  Phone,
  LayoutDashboard,
  Heart,
  Wallet,
  MessageCircle,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { DAILY_RENTS_ENABLED } from "@/lib/features";
import Image from "next/image";

const navLinks = [
  { key: "home", href: "/", icon: Home, kind: "secondary" },
  { key: "listings", href: "/listings", icon: Building2, kind: "primary" },
  { key: "dailyRents", href: "/daily-rents", icon: CalendarDays, kind: "primary" },
  { key: "eventHalls", href: "/event-halls", icon: PartyPopper, kind: "primary" },
  { key: "about", href: "/about", icon: Info, kind: "secondary" },
  { key: "contact", href: "/contact", icon: Phone, kind: "secondary" },
].filter((link) => link.key !== "dailyRents" || DAILY_RENTS_ENABLED);

const accountLinks = [
  { key: "myAds", href: "/account/my-ads", icon: LayoutDashboard },
  { key: "favorites", href: "/account/favorites", icon: Heart },
  { key: "wallet", href: "/account/wallet", icon: Wallet },
  { key: "bookings", href: "/account/bookings", icon: CalendarDays },
  { key: "chat", href: "/account/chat", icon: MessageCircle },
  { key: "profile", href: "/account/profile", icon: UserCircle },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, user, logout } = useAuthStore();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function labelFor(link: (typeof navLinks)[number]) {
    return t(link.key as Parameters<typeof t>[0]);
  }

  function toggleLocale() {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  }

  async function handleLogout() {
    logout();
    import('@/lib/socket').then(({ disconnectChatSocket }) => disconnectChatSocket()).catch(() => {});
    setDropdownOpen(false);
    router.push("/");
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(false);
      setDropdownOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const avatarContent = user?.profilePhoto ? (
    <Image
      src={user.profilePhoto}
      alt={user.name ?? ""}
      width={36}
      height={36}
      className="rounded-full object-cover"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm select-none">
      {user?.name?.charAt(0) ?? "؟"}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-line shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black text-primary tracking-tight">
            أقورا
          </span>
          <span className="hidden sm:block text-xs text-hint border-l border-line pl-2 ml-1 leading-tight">
            Aqora
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-white text-primary shadow-sm ring-1 ring-primary/20"
                      : link.kind === "primary"
                        ? "text-ink hover:bg-white hover:text-primary"
                        : "text-muted hover:bg-white hover:text-ink"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.4 : 2} />
                  <span>{labelFor(link)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="text-sm px-3 py-1.5 rounded-full border border-line text-muted hover:border-primary hover:text-primary transition-all font-medium"
          >
            {locale === "ar" ? "EN" : "عربي"}
          </button>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-1 py-0.5 transition-all ${
                  pathname.startsWith("/account")
                    ? "ring-2 ring-primary/35"
                    : "hover:ring-2 hover:ring-primary/30"
                }`}
                aria-expanded={dropdownOpen}
              >
                {avatarContent}
                <ChevronDown size={14} className="text-muted hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-line p-2 z-50 ${
                    locale === "ar" ? "left-0" : "right-0"
                  }`}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <div className="flex items-center gap-3 px-3 py-3 border-b border-line mb-1">
                    {avatarContent}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{user?.name ?? t("account")}</p>
                      <p className="text-xs text-muted truncate">{user?.phone ?? user?.email ?? t("dashboard")}</p>
                    </div>
                  </div>
                  {accountLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary-soft text-accent-text"
                            : "text-ink hover:bg-surface"
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon size={17} />
                        {t(link.key as Parameters<typeof t>[0])}
                      </Link>
                    );
                  })}
                  <hr className="my-1 border-line" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error-soft transition-colors"
                  >
                    <LogOut size={17} />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-full border border-primary text-accent-text hover:bg-primary-soft transition-all font-medium"
              >
                {t("login")}
              </Link>
              <a
                href="#download"
                className="hidden sm:inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                {t("download")}
              </a>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-muted hover:bg-surface"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-line bg-white px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line text-muted hover:border-primary/40"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={17} />
                  {labelFor(link)}
                </Link>
              );
            })}
          </div>
          {isLoggedIn ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="px-1 pb-2 text-xs font-bold text-muted">{t("account")}</p>
              <div className="grid grid-cols-2 gap-2">
                {accountLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        active ? "bg-primary-soft text-accent-text" : "bg-surface text-muted"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={16} />
                      {t(link.key as Parameters<typeof t>[0])}
                    </Link>
                  );
                })}
              </div>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-error bg-error-soft">
                <LogOut size={16} />
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 border-t border-line pt-4">
              <Link href="/login" className="flex justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary" onClick={() => setOpen(false)}>{t("login")}</Link>
              <a href="#download" className="inline-flex justify-center bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors" onClick={() => setOpen(false)}>{t("download")}</a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
