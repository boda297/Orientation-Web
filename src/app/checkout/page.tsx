'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { SubscriptionPlan } from '@/types/paymob';

interface ExtendedPlan extends SubscriptionPlan {
  features: {
    basePriceLabel: string;
    vatLabel: string;
    totalLabel: string;
    quality: string;
    access: string;
    devices: string;
  };
}

const PLANS: ExtendedPlan[] = [
  {
    id: '3months',
    title: 'اشتراك 3 شهور',
    duration: '3 شهور وصول كامل',
    basePrice: 90,
    vatAndFees: 16.76,
    totalAmount: 106.76,
    badge: 'بجنيه في اليوم',
    isPopular: true,
    disabled: false,
    features: {
      basePriceLabel: '90 EGP',
      vatLabel: '16.76 EGP',
      totalLabel: '106.76 EGP',
      quality: 'FHD 1080p',
      access: 'وصول لكافة المشاريع والحلقات المقفولة',
      devices: 'جميع الأجهزة (الهاتف، التابلت، الشاشة)',
    },
  },
  {
    id: '6months',
    title: 'اشتراك 6 شهور',
    duration: '6 شهور وصول كامل',
    basePrice: 170,
    vatAndFees: 29.88,
    totalAmount: 199.88,
    badge: '',
    isPopular: false,
    disabled: false,
    features: {
      basePriceLabel: '170 EGP',
      vatLabel: '29.88 EGP',
      totalLabel: '199.88 EGP',
      quality: 'FHD 1080p',
      access: 'وصول لكافة المشاريع والحلقات المقفولة',
      devices: 'جميع الأجهزة (الهاتف، التابلت، الشاشة)',
    },
  },
  {
    id: '1year',
    title: 'اشتراك سنة كاملة',
    duration: '12 شهر وصول غير محدود',
    basePrice: 0,
    vatAndFees: 0,
    totalAmount: 0,
    badge: 'قريباً',
    disabled: true,
    disabledReason: 'ستكون هذه الخطة متاحة قريباً جداً',
    features: {
      basePriceLabel: '-',
      vatLabel: '-',
      totalLabel: 'قريباً',
      quality: 'Ultra HD 4K',
      access: 'وصول كامل بدون حد أقصى',
      devices: 'جميع الأجهزة',
    },
  },
];

export default function CheckoutPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<'3months' | '6months' | '1year'>('3months');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedPlan.disabled) {
      setErrorMessage('هذه الخطة غير متاحة حالياً، برجاء اختيار خطة أخرى.');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('برجاء إدخال الاسم الأول والعائلة بشكل صحيح');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('برجاء إدخال البريد الإلكتروني بشكل صحيح');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('برجاء إدخال رقم هاتف صحيح');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/paymob/create-intention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.totalAmount, // Sends 106.76 or 199.88 EGP
          currency: 'EGP',
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          description: `${selectedPlan.title} - Orientation Platform`,
          orderId: `SUB-${selectedPlan.id}-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.checkoutUrl) {
        throw new Error(data.error || 'حدث خطأ أثناء تجهيز عملية الدفع مع Paymob');
      }

      // Redirect to Paymob Unified Checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('[Checkout Error]:', err);
      setErrorMessage(err.message || 'تعذر الاتصال ببوابة الدفع، حاول مرة أخرى');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#e50914] selection:text-white dir-rtl">
      {/* Platform Header */}
      <Header />

      {/* Main Container */}
      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e50914] block mb-2">
            STEP 1 OF 2
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            اختر الخطة المناسبة لك
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            بدون عقود، يمكنك الإلغاء أو التغيير في أي وقت.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;

            // 1-Year Locked Card
            if (plan.disabled) {
              return (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-[#121212] border border-zinc-800/80 overflow-hidden opacity-70 cursor-not-allowed select-none flex flex-col justify-between"
                >
                  <div className="p-6 bg-zinc-900/60 border-b border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-2xl font-bold text-zinc-300">{plan.title}</h3>
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-amber-400 font-bold text-xs border border-zinc-700">
                        {plan.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{plan.duration}</p>
                  </div>

                  <div className="p-6 space-y-4 text-xs text-zinc-400 flex-1 flex flex-col justify-center">
                    <div className="py-2 border-b border-zinc-800/60 flex justify-between">
                      <span>حالة الخطة:</span>
                      <span className="text-amber-400 font-semibold">متاحة قريباً</span>
                    </div>
                    <div className="py-2 border-b border-zinc-800/60 flex justify-between">
                      <span>الجودة:</span>
                      <span className="text-zinc-300">{plan.features.quality}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span>الوصول:</span>
                      <span className="text-zinc-300">{plan.features.access}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 font-medium">
                      {plan.disabledReason}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id as any)}
                className={`rounded-3xl bg-[#121212] overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#e50914] shadow-[0_0_35px_rgba(229,9,20,0.2)] scale-[1.02] ring-1 ring-[#e50914]'
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-[#151515]'
                }`}
              >
                <div>
                  {/* Top Premium Banner for 3 Months */}
                  {plan.id === '3months' && plan.badge && (
                    <div className="relative overflow-hidden bg-gradient-to-l from-[#e50914] via-[#c2070f] to-[#8b0000] text-white text-center py-4 px-6">
                      {/* Subtle diagonal shine animation */}
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite]" />
                      <span className="relative text-lg font-black tracking-wide drop-shadow-md">{plan.badge}</span>
                    </div>
                  )}

                  {/* Card Header Box */}
                  <div className={`p-6 border-b border-zinc-800 ${
                    isSelected ? 'bg-gradient-to-b from-red-950/40 to-transparent' : 'bg-zinc-900/30'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                          {plan.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1">{plan.duration}</p>
                      </div>

                      {/* Selection Radio Circle */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#e50914] border-[#e50914] text-white shadow-md'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Price Header */}
                    <div className="mt-5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">{plan.basePrice}</span>
                      <span className="text-zinc-400 text-xs font-medium">جنيه مصري</span>
                    </div>
                  </div>

                  {/* Feature Rows */}
                  <div className="p-6 space-y-3 text-xs text-zinc-400">
                    <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                      <span>سعر الخطة الأساسي:</span>
                      <span className="text-zinc-200 font-semibold">{plan.features.basePriceLabel}</span>
                    </div>

                    <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                      <span>الضرائب والرسوم (VAT):</span>
                      <span className="text-zinc-300 font-semibold">{plan.features.vatLabel}</span>
                    </div>

                    <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center font-bold text-[#e50914]">
                      <span>الإجمالي الكلي:</span>
                      <span className="text-base">{plan.features.totalLabel}</span>
                    </div>

                    <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                      <span>الجودة:</span>
                      <span className="text-zinc-200">{plan.features.quality}</span>
                    </div>

                    <div className="py-2 flex justify-between items-center">
                      <span>الأجهزة:</span>
                      <span className="text-zinc-200">{plan.features.devices}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                  <span className={`text-xs font-semibold ${
                    isSelected ? 'text-[#e50914]' : 'text-zinc-500'
                  }`}>
                    {isSelected ? 'الخطة المختارة حالياً' : 'اضغط لاختيار الخطة'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP 2 - Form & Invoice Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Form Card (Left Column) */}
          <div className="lg:col-span-7 bg-[#121212] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e50914] block mb-1">
                  STEP 2 OF 2
                </span>
                <h2 className="text-2xl font-bold text-white">إدخال بيانات المشترك</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  أدخل بياناتك لإتمام عملية الدفع عبر Paymob
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                  {errorMessage.includes('PAYMOB_SECRET_KEY') && (
                    <div className="mt-1 p-3 bg-black rounded-xl text-xs text-zinc-300 font-mono border border-zinc-800">
                      <p className="text-amber-400 font-bold mb-1">💡 تنبيه إعدادات Paymob:</p>
                      قم بإضافة المفاتيح الخاصة بحساب Paymob في ملف <span className="text-white">.env.local</span>:
                      <pre className="mt-2 text-emerald-400 bg-zinc-950 p-2 rounded border border-zinc-800 overflow-x-auto dir-ltr">
PAYMOB_SECRET_KEY=egy_sk_test_...
NEXT_PUBLIC_PAYMOB_PUBLIC_KEY=egy_pk_test_...
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Vertical Inputs Form */}
              <form id="paymob-checkout-form" onSubmit={handlePaymentSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      الاسم الأول <span className="text-[#e50914]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="أحمد"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#e50914] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      اسم العائلة <span className="text-[#e50914]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="محمود"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#e50914] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    البريد الإلكتروني <span className="text-[#e50914]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ahmed@example.com"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#e50914] transition-colors text-left dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    رقم المحمول (فودافون كاش / اتصالات / أورنج / وي) <span className="text-[#e50914]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01012345678"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#e50914] transition-colors text-left dir-ltr"
                  />
                </div>
              </form>
            </div>

            {/* Submit Button */}
            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                type="submit"
                form="paymob-checkout-form"
                disabled={loading || selectedPlan.disabled}
                className="w-full h-14 bg-[#e50914] hover:bg-[#b9090b] text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>جاري التحويل لبوابة Paymob...</span>
                ) : (
                  <>
                    <span>متابعة الدفع ({selectedPlan.totalAmount} EGP)</span>
                    <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invoice Summary Card (Right Column) */}
          <div className="lg:col-span-5 bg-[#121212] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[500px]">
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-zinc-800 pb-4">
                <span className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-sm font-bold">2</span>
                <span>ملخص الفاتورة</span>
              </h2>

              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-2xl bg-black border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">الخطة المختارة</span>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-base">{selectedPlan.title}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-red-600/20 text-red-500 font-bold border border-red-600/30">
                      {selectedPlan.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>اشتراك الخطة الأساسي:</span>
                    <span className="font-semibold text-white">{selectedPlan.basePrice} EGP</span>
                  </div>

                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>الضرائب والرسوم (VAT):</span>
                    <span className="font-semibold text-zinc-300">{selectedPlan.vatAndFees} EGP</span>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-white">الإجمالي المستحق للدفع:</span>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-[#e50914]">
                        {selectedPlan.totalAmount}
                      </span>
                      <span className="text-xs text-zinc-400 block font-normal">جنيه مصري (EGP)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
              <p className="text-xs font-semibold text-zinc-400 mb-3">الدفع مشفر وآمن 100% بواسطة Paymob</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-300 font-medium">
                <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">Visa / Mastercard</span>
                <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">Vodafone Cash</span>
                <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">Valu</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Platform Footer */}
      <Footer />
    </div>
  );
}
