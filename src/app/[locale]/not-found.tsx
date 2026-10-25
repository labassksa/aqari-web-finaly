import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center">
        <p className="text-8xl font-black text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-ink mb-3">الصفحة غير موجودة</h1>
        <p className="text-muted mb-8 max-w-sm">
          العقار الذي تبحث عنه غير متاح أو تم حذفه.
        </p>
        <Link
          href="/listings"
          className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-2xl transition-colors"
        >
          تصفح العقارات
        </Link>
      </main>
      <Footer />
    </>
  );
}
