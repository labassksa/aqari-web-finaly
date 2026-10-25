import { getTranslations } from "next-intl/server";
import PageShell from "@/components/PageShell";
import ContactForm from "@/components/ContactForm";
import { Mail, MessageCircle } from "lucide-react";

export async function generateMetadata() {
  return { title: "اتصل بنا | أقورا" };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-black text-ink mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted">{t("subtitle")}</p>
          <div className="mt-5 h-1 w-16 bg-primary rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact channels */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-bold text-ink">
              {t("channels.title")}
            </h2>

            <a
              href="mailto:yazeed@aqora.sa"
              className="flex items-center gap-4 p-5 bg-surface hover:bg-primary/10 border border-line hover:border-primary/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
                <Mail size={22} className="text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted mb-0.5">
                  {t("channels.email")}
                </div>
                <div className="font-semibold text-ink group-hover:text-primary transition-colors text-sm">
                  yazeed@aqora.sa
                </div>
              </div>
            </a>

            <a
              href="https://wa.me/966"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-surface hover:bg-success-soft border border-line hover:border-success/30 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-success-soft rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle size={22} className="text-success" />
              </div>
              <div>
                <div className="text-xs text-muted mb-0.5">
                  {t("channels.whatsapp")}
                </div>
                <div className="font-semibold text-ink group-hover:text-success transition-colors text-sm">
                  WhatsApp
                </div>
              </div>
            </a>

            <div className="p-5 bg-primary/8 border border-primary/20 rounded-2xl">
              <p className="text-sm text-muted leading-relaxed">
                نرد على جميع الاستفسارات خلال 24 ساعة في أيام العمل.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-line shadow-sm p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
