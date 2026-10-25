import { getTranslations } from "next-intl/server";
import PageShell from "@/components/PageShell";
import { Trash2, AlertTriangle, Mail } from "lucide-react";

export async function generateMetadata() {
  return { title: "حذف الحساب | أقورا" };
}

export default async function DeleteAccountPage() {
  const t = await getTranslations("deleteAccount");

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="w-16 h-16 bg-error-soft rounded-2xl flex items-center justify-center mb-6">
            <Trash2 size={28} className="text-error" />
          </div>
          <h1 className="text-4xl font-black text-ink mb-3">{t("title")}</h1>
          <p className="text-muted leading-relaxed text-lg">{t("subtitle")}</p>
          <div className="mt-5 h-1 w-16 bg-primary rounded-full" />
        </div>

        <div className="space-y-8">
          {/* Steps */}
          <section className="bg-surface rounded-2xl p-7">
            <h2 className="text-xl font-bold text-ink mb-6">
              {t("steps.title")}
            </h2>
            <ol className="space-y-4">
              {(t.raw("steps.items") as string[]).map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted leading-relaxed pt-1">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Alternative */}
          <section className="bg-white border border-line rounded-2xl p-7 shadow-sm">
            <h2 className="text-xl font-bold text-ink mb-3 flex items-center gap-2">
              <Mail size={20} className="text-primary" />
              {t("alternative.title")}
            </h2>
            <p className="text-muted text-sm mb-4">{t("alternative.text")}</p>
            <a
              href={`mailto:${t("email")}?subject=طلب حذف الحساب`}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Mail size={16} />
              {t("email")}
            </a>
          </section>

          {/* What gets deleted */}
          <section className="bg-error-soft border border-error/20 rounded-2xl p-7">
            <h2 className="text-xl font-bold text-ink mb-5">
              {t("deleted.title")}
            </h2>
            <ul className="space-y-3">
              {(t.raw("deleted.items") as string[]).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-muted">
                  <span className="mt-1 text-error shrink-0">✕</span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Important note */}
          <div className="flex items-start gap-3 p-5 bg-primary-soft border border-secondary/60 rounded-2xl">
            <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-accent-text leading-relaxed">{t("note")}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
