'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  
  // Paymob query params
  const transactionId = searchParams.get('id') || searchParams.get('transaction_id') || 'N/A';
  const orderId = searchParams.get('order') || searchParams.get('merchant_order_id') || 'N/A';
  const amountCents = searchParams.get('amount_cents');
  const pending = searchParams.get('pending');

  const formattedAmount = amountCents ? (Number(amountCents) / 100).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#ff0000] selection:text-white">
      <Header />

      <main className="pt-32 pb-20 px-4 flex items-center justify-center dir-rtl">
        <div className="max-w-md w-full bg-[#111] border border-zinc-800 rounded-[2.5rem] p-8 text-center shadow-2xl relative">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">تمت عملية الدفع بنجاح!</h1>
          <p className="text-gray-400 text-sm mb-6">
            شكراً لك، تم تأكيد عملية الدفع عبر بوابة Paymob وحفظ طلبك بنجاح.
          </p>

          {/* Details Card */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-right space-y-3 mb-8 text-sm">
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">حالة العملية:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {pending === 'true' ? 'قيد المراجعة / ناجح' : 'مكتمل بنجاح'}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">رقم العملية (Transaction ID):</span>
              <span className="font-mono text-gray-200 dir-ltr">{transactionId}</span>
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">رقم الطلب (Order Reference):</span>
              <span className="font-mono text-gray-200 dir-ltr">{orderId}</span>
            </div>

            {formattedAmount && (
              <div className="flex justify-between items-center text-gray-300 border-t border-zinc-800 pt-3">
                <span className="text-gray-400">المبلغ المدفوع:</span>
                <span className="font-bold text-white text-base">{formattedAmount} EGP</span>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-4 rounded-full bg-[#ff0000] hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-600/30 text-center"
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white dir-rtl">
        جاري تحميل تفاصيل عملية الدفع...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
