'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { clearApiCache } from '@/lib/http/httpClient';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');

  // Paymob query params
  const transactionId =
    params.get('id') || params.get('transaction_id') || 'N/A';
  const orderId =
    params.get('order') || params.get('merchant_order_id') || 'N/A';
  const amountCents = params.get('amount_cents');
  const success = params.get('success');
  const pending = params.get('pending');
  const txnCode = params.get('txn_response_code');

  const formattedAmount = amountCents
    ? (Number(amountCents) / 100).toLocaleString()
    : null;

  useEffect(() => {
    let resolved: 'success' | 'pending' | 'failed';

    if (success === 'true' && pending === 'false') {
      resolved = 'success';
    } else if (pending === 'true') {
      resolved = 'pending';
    } else if (success === 'false' || txnCode === 'DECLINED' || txnCode === 'BLOCKED') {
      resolved = 'failed';
    } else if (success !== null) {
      resolved = success === 'true' ? 'success' : 'failed';
    } else {
      resolved = 'success';
    }

    setStatus(resolved);

    // After a confirmed successful payment, verify subscription and bust all caches
    // so project pages immediately reflect hasAccess=true for the newly subscribed user.
    if (resolved === 'success') {
      // 1. Clear all cached API responses (projects cache contains stale hasAccess=false)
      clearApiCache();

      // 2. Confirm subscription is active on the backend (best-effort, non-blocking)
      subscriptionApi.getMySubscription().catch(() => {
        // Silently ignore — the webhook may not have fired yet; the cache bust alone
        // ensures the next project visit makes a fresh hasAccess-aware request.
      });
    }
  }, [params, success, pending, txnCode]);


  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#ff0000] selection:text-white">
      <Header />

      <main className="pt-32 pb-20 px-4 flex items-center justify-center dir-rtl">
        <div className="max-w-md w-full bg-[#111] border border-zinc-800 rounded-[2.5rem] p-8 text-center shadow-2xl relative">
          {status === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">جاري التحقق من عملية الدفع...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-6">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-black text-white mb-2">
                تمت عملية الدفع بنجاح!
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                شكراً لك، تم تأكيد عملية الدفع عبر بوابة Paymob وتفعيل اشتراكك بنجاح.
              </p>

              {/* Details Card */}
              <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-right space-y-3 mb-8 text-sm">
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400">حالة العملية:</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    مكتمل بنجاح
                  </span>
                </div>

                {transactionId !== 'N/A' && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">
                      رقم العملية (Transaction ID):
                    </span>
                    <span className="font-mono text-gray-200 dir-ltr text-xs">
                      {transactionId}
                    </span>
                  </div>
                )}

                {orderId !== 'N/A' && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">
                      رقم الطلب (Order Reference):
                    </span>
                    <span className="font-mono text-gray-200 dir-ltr text-xs">
                      {orderId}
                    </span>
                  </div>
                )}

                {formattedAmount && (
                  <div className="flex justify-between items-center text-gray-300 border-t border-zinc-800 pt-3">
                    <span className="text-gray-400">المبلغ المدفوع:</span>
                    <span className="font-bold text-white text-base">
                      {formattedAmount} EGP
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full py-4 rounded-full bg-[#ff0000] hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-600/30 text-center"
                >
                  البدء في المشاهدة
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div>
              <div className="mx-auto w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">الدفع قيد المراجعة</h1>
              <p className="text-gray-400 text-sm mb-6">
                عملية الدفع قيد المعالجة حالياً. سيتم تفعيل اشتراكك تلقائياً بمجرد تأكيد المعاملة.
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full py-4 rounded-full bg-[#ff0000] hover:bg-red-700 text-white font-bold transition shadow-lg text-center"
                >
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">فشلت عملية الدفع</h1>
              <p className="text-gray-400 text-sm mb-6">
                لم نتمكن من إتمام عملية الدفع. يرجى التأكد من بيانات بطاقتك أو رصيدك والمحاولة مرة أخرى.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 rounded-full bg-[#ff0000] hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-600/30 text-center"
                >
                  إعادة المحاولة
                </button>
                <Link
                  href="/"
                  className="block w-full py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-medium text-sm transition text-center"
                >
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white dir-rtl">
          جاري تحميل تفاصيل عملية الدفع...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
