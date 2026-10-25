import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import PageShell from "@/components/PageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "en"
      ? "Intellectual Property Policy | Aqora"
      : "سياسة الملكية الفكرية | أقورا";

  return { title };
}

export default async function IntellectualPropertyPage() {
  const t = await getTranslations("intellectualProperty");
  const contentSections = ["ownership", "license", "prohibited"] as const;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-ink mb-3">
            {t("title")}
          </h1>
          <p className="text-base text-muted">{t("subtitle")}</p>
          <div className="mt-4 h-1 w-16 bg-primary rounded-full" />
        </header>

        <div className="space-y-10">
          {contentSections.map((key) => (
            <section key={key} className="bg-surface rounded-2xl p-7">
              <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
                {t(`sections.${key}.title`)}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {t(`sections.${key}.text`)}
              </p>
            </section>
          ))}

          <section className="bg-primary-soft border border-secondary/40 rounded-2xl p-7">
            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
              {t("sections.report.title")}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {t("sections.report.intro")}{" "}
              <a
                href="mailto:legal@aqora.sa"
                className="text-primary font-semibold hover:text-accent-text transition-colors"
              >
                legal@aqora.sa
              </a>{" "}
              {t("sections.report.or")}{" "}
              <Link
                href="/complaints"
                className="text-primary font-semibold underline underline-offset-4 hover:text-accent-text transition-colors"
              >
                {t("sections.report.complaints")}
              </Link>
              .
            </p>
          </section>

          <section className="bg-surface rounded-2xl p-7">
            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
              {t("sections.actions.title")}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {t("sections.actions.text")}
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
