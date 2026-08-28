"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function FailedContent() {
  const searchParams = useSearchParams();

  // Paymob query params
  const transactionId = searchParams.get("id") || "N/A";
  const txnResponseCode =
    searchParams.get("txn_response_code") ||
    searchParams.get("error") ||
    "فشلت العملية";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#ff0000] selection:text-white">
      <Header />

      <main className="pt-32 pb-20 px-4 flex items-center justify-center dir-rtl">
        <div className="max-w-md w-full bg-[#111] border border-zinc-800 rounded-[2.5rem] p-8 text-center shadow-2xl relative">
          {/* Failed Icon */}
          <div className="mx-auto w-20 h-20 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center text-red-500 mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">
            لم تكتمل عملية الدفع
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            تعذر إتمام الدفع بنجاح عبر Paymob. قد يكون السبب رفض البطاقة أو
            إلغاء العملية.
          </p>

          {/* Details Card */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-right space-y-3 mb-8 text-sm">
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">حالة العملية:</span>
              <span className="px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold">
                غير مكتملة / ملغاة
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">رقم العملية (إن وجد):</span>
              <span className="font-mono text-gray-200 dir-ltr">
                {transactionId}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">رمز استجابة المعاملة:</span>
              <span className="font-mono text-red-400 text-xs dir-ltr">
                {txnResponseCode}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full py-4 rounded-full bg-[#ff0000] hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-600/30 text-center"
            >
              إعادة المحاولة الآن
            </Link>

            <Link
              href="/"
              className="block w-full py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-medium text-sm transition text-center"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white dir-rtl">
          جاري تحميل تفاصيل الحالة...
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
