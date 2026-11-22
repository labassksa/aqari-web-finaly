import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "أقورا | منصتك العقارية في المملكة العربية السعودية",
  description:
    "أقورا — منصة عقارية متكاملة للبيع والإيجار في المملكة العربية السعودية. ابحث، تواصل، وأتمّ صفقاتك بأمان.",
  keywords: "عقارات، سعودية، بيع، إيجار، أقورا، aqora",
  openGraph: {
    title: "أقورا | منصتك العقارية في المملكة العربية السعودية",
    description: "منصة عقارية متكاملة لكل أطراف السوق العقاري السعودي",
    siteName: "أقورا",
    locale: "ar_SA",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <div
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-white text-ink"
    >
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
