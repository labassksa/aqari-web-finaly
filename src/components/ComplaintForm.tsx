"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { submitComplaint } from "@/lib/api";

type SubmissionResult = {
  number: string;
  createdAt: string;
};

const inputClasses =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#222222] outline-none transition-all placeholder:text-gray-400 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20";

export default function ComplaintForm() {
  const t = useTranslations("complaints");
  const locale = useLocale();
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const response = await submitComplaint({
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        ...(email ? { email } : {}),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });
      setResult(response);
      form.reset();
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const formattedDate = new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" },
    ).format(new Date(result.createdAt));

    return (
      <div
        className="rounded-2xl border border-green-200 bg-green-50 p-7 text-center sm:p-10"
        role="status"
      >
        <CheckCircle2
          size={56}
          className="mx-auto mb-5 text-green-600"
          aria-hidden="true"
        />
        <h2 className="mb-6 text-2xl font-black text-green-800">
          {t("success.title")}
        </h2>
        <div className="space-y-3 text-sm text-green-900">
          <p>
            <span className="font-semibold">{t("success.number")}</span>{" "}
            <bdi dir="ltr" className="font-bold">
              {result.number}
            </bdi>
          </p>
          <p>
            <span className="font-semibold">{t("success.date")}</span>{" "}
            {formattedDate}
          </p>
          <p className="pt-2 font-semibold">{t("success.followUp")}</p>
        </div>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-7 rounded-xl border border-green-300 bg-white px-5 py-2.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-100"
        >
          {t("success.another")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label={t("fields.name")} htmlFor="complaint-name">
        <input
          id="complaint-name"
          name="name"
          type="text"
          required
          maxLength={255}
          autoComplete="name"
          placeholder={t("placeholders.name")}
          className={inputClasses}
        />
      </FormField>

      <FormField label={t("fields.phone")} htmlFor="complaint-phone">
        <input
          id="complaint-phone"
          name="phone"
          type="tel"
          required
          maxLength={50}
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
          placeholder={t("placeholders.phone")}
          className={`${inputClasses} text-start`}
        />
      </FormField>

      <FormField
        label={`${t("fields.email")} (${t("fields.emailOptional")})`}
        htmlFor="complaint-email"
      >
        <input
          id="complaint-email"
          name="email"
          type="email"
          maxLength={255}
          autoComplete="email"
          dir="ltr"
          placeholder={t("placeholders.email")}
          className={`${inputClasses} text-start`}
        />
      </FormField>

      <FormField label={t("fields.subject")} htmlFor="complaint-subject">
        <input
          id="complaint-subject"
          name="subject"
          type="text"
          required
          maxLength={255}
          placeholder={t("placeholders.subject")}
          className={inputClasses}
        />
      </FormField>

      <FormField label={t("fields.message")} htmlFor="complaint-message">
        <textarea
          id="complaint-message"
          name="message"
          required
          maxLength={10000}
          rows={7}
          placeholder={t("placeholders.message")}
          className={`${inputClasses} resize-y`}
        />
      </FormField>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#E09400] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        ) : (
          <Send size={18} aria-hidden="true" />
        )}
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-[#222222]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
