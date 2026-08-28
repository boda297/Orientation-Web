'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SubscribeResultRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/checkout/success${query ? `?${query}` : ''}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white dir-rtl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">جاري معالجة نتيجة الدفع...</p>
      </div>
    </div>
  );
}

export default function SubscribeResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white dir-rtl">
          جاري التحميل...
        </div>
      }
    >
      <SubscribeResultRedirect />
    </Suspense>
  );
}
