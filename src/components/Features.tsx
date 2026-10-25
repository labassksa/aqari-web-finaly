import { getTranslations } from "next-intl/server";
import { Search, MessageCircle, Wallet, Star, BarChart3, BadgeCheck } from "lucide-react";

const featureIcons = [Search, MessageCircle, Wallet, Star, BarChart3, BadgeCheck];
const featureKeys = ["search", "chat", "wallet", "promotions", "crm", "licensed"] as const;
const featureColors = [
  "bg-info/10 text-info",
  "bg-success-soft text-success",
  "bg-primary/10 text-accent-text",
  "bg-purple-50 text-purple-600",
  "bg-indigo-50 text-indigo-600",
  "bg-success-soft text-success",
];

export default async function Features() {
  const t = await getTranslations("features");

  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-ink mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            return (
              <div
                key={key}
                className="bg-white rounded-2xl p-7 shadow-sm border border-line hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${featureColors[i]}`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {t(`${key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
