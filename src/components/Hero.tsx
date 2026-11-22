import { getTranslations } from "next-intl/server";
import { Building2, PartyPopper, Plus, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

const APPLE_ICON =
  "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.2 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.77M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z";
const PLAY_ICON =
  "M3.18 23.76c.3.17.64.24.99.2l12.6-12.6-3.56-3.56L3.18 23.76zM20.65 9.05l-2.37-1.36-3.97 3.97 3.97 3.97 2.39-1.37c.68-.39 1.13-1.11 1.13-1.95 0-.84-.45-1.55-1.15-1.95v-.31zm-17.5-6.8c-.04.14-.06.29-.06.46v18.58c0 .17.02.32.06.46l12.65-12.65L3.15 2.25zM13.22 12l-9.04 9.04-.99.19c.3.17.64.24.99.2l9.04-9.04-3.56-3.56 3.56 3.17z";

export default async function Hero() {
  const t = await getTranslations("hero");

  const cards = [
    {
      href: "/listings",
      icon: Building2,
      title: t("cardListingsTitle"),
      desc: t("cardListingsDesc"),
    },
    {
      href: "/event-halls",
      icon: PartyPopper,
      title: t("cardEventHallsTitle"),
      desc: t("cardEventHallsDesc"),
    },
    {
      href: "/add-listing",
      icon: Plus,
      title: t("cardAddTitle"),
      desc: t("cardAddDesc"),
    },
  ];

  const stores = [
    { name: "App Store", icon: APPLE_ICON },
    { name: "Google Play", icon: PLAY_ICON },
  ];

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-accent-text text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t("badge")}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink leading-tight mb-6 max-w-4xl mx-auto">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-10">
          {t("subtitle")}
        </p>

        {/* Main actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/listings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            {t("browse")}
            <ArrowLeft size={18} className="rtl:rotate-0 ltr:rotate-180" />
          </Link>
          <Link
            href="/add-listing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-ink/80 text-ink hover:bg-ink hover:text-white font-bold px-8 py-3.5 rounded-2xl transition-all"
          >
            <Plus size={18} />
            {t("addListing")}
          </Link>
        </div>

        {/* App stores (coming soon) */}
        <div id="download" className="flex items-center justify-center gap-2 mt-5">
          {stores.map((store) => (
            <span
              key={store.name}
              className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-ink px-3.5 py-2 rounded-xl"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                <path d={store.icon} />
              </svg>
              <span className="text-start leading-none">
                <span className="block text-[10px] text-hint mb-0.5">{t("comingSoon")}</span>
                <span className="block text-xs font-bold">{store.name}</span>
              </span>
            </span>
          ))}
        </div>

        {/* Quick-access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 text-start">
          {cards.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white border border-gray-200 hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon size={22} />
              </div>
              <h2 className="text-base font-bold text-ink mb-1.5">{title}</h2>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 text-sm text-hint">
          <div className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>مرخّص من هيئة العقار</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>آمن ومشفّر</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>مجاني للمشترين</span>
          </div>
        </div>
      </div>
    </section>
  );
}
