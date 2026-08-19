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
          <h1 className="mb-3 text-4xl font-black text-[#222222]">
            {t("title")}
          </h1>
          <p className="text-base leading-relaxed text-[#717171]">
            {t("subtitle")}
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#F5A623]" />
        </header>

        <div className="rounded-2xl border border-gray-100 bg-[#F9F9F9] p-6 shadow-sm sm:p-8">
          <ComplaintForm />
        </div>
      </div>
    </PageShell>
  );
}
