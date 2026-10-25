import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ComplaintForm from "@/components/ComplaintForm";
import PageShell from "@/components/PageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Submit a Complaint | Aqora" : "تقديم شكوى | أقورا",
  };
}

export default async function ComplaintsPage() {
  const t = await getTranslations("complaints");

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <header className="mb-10">
          <h1 className="mb-3 text-4xl font-black text-ink">
            {t("title")}
          </h1>
          <p className="text-base leading-relaxed text-muted">
            {t("subtitle")}
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
        </header>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <ComplaintForm />
        </div>
      </div>
    </PageShell>
  );
}
