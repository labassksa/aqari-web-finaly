import { getTranslations } from "next-intl/server";
import { Home, Briefcase, Users, CalendarDays, Building2 } from "lucide-react";

const userIcons = [Home, Briefcase, Users, CalendarDays, Building2];
const userKeys = ["owners", "brokers", "buyers", "hosts", "developers"] as const;
const userEmoji = ["🏠", "🤝", "👤", "🌙", "🏗️"];

export default async function UserTypes() {
  const t = await getTranslations("users");

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-ink mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted">{t("subtitle")}</p>
        </div>

        {/* User type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {userKeys.map((key, i) => {
            const Icon = userIcons[i];
            return (
              <div
                key={key}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border border-line hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-ink mb-2">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
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
