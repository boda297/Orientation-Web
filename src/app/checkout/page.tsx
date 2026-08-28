"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tokenStorage } from "@/lib/http/tokenStorage";
import { subscriptionPlansApi } from "@/lib/api/subscription-plan.api";
import { subscriptionApi } from "@/lib/api/subscription.api";
import type { SubscriptionPlan } from "@/types/subscription-plan.types";

export default function CheckoutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const authenticated = tokenStorage.isValid();
    setIsAuthenticated(authenticated);
  }, []);

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const data = await subscriptionPlansApi.getActivePlans();
        if (data && Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
          );
          setPlans(sorted);
          setSelectedPlanId(sorted[0]._id);
        } else {
          setPlans([]);
        }
      } catch (err: any) {
        console.error("[Fetch Plans Error]:", err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId) || plans[0];

  // Checkout handler
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check Auth
    if (!tokenStorage.isValid()) {
      setIsAuthenticated(false);
      router.push("/login?redirect=/checkout");
      return;
    }

    // 2. Validate selected plan
    if (!selectedPlan?._id) {
      setErrorMessage("برجاء اختيار خطة اشتراك صالحة أولاً.");
      return;
    }

    setLoading(true);

    try {
      // 1. Send selected plan ID to backend (POST /api/v1/subscriptions/checkout)
      const res = await subscriptionApi.checkout(selectedPlan._id);

      if (res?.checkoutUrl) {
        // 2. Redirect user to Paymob hosted checkout page
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("لم يتم استلام رابط الدفع من الخادم.");
      }
    } catch (err: any) {
      console.error("[Checkout Error]:", err);
      setErrorMessage(err?.message || "تعذر الاتصال ببوابة الدفع، حاول مرة أخرى");
      setLoading(false);
    }
  };

  // Helper to extract feature label
  const getPlanDurationLabel = (plan: SubscriptionPlan) => {
    if (plan.durationDays === 90) return "3 شهور وصول كامل";
    if (plan.durationDays === 180) return "6 شهور وصول كامل";
    if (plan.durationDays === 365) return "12 شهر وصول غير محدود";
    return `${plan.durationDays} يوم وصول كامل`;
  };

  const getPlanBadge = (plan: SubscriptionPlan, index: number) => {
    if (
      plan.durationDays === 90 ||
      plan.code === "plan_3_months" ||
      index === 0
    ) {
      return "بجنيه في اليوم";
    }
    return "";
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

        {/* ── Plans Loading State ────────────────────────────────────────── */}
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 items-stretch max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-[#121212] border border-zinc-800 h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          /* ── Plan Cards Grid (3 Columns) ───────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
            {plans.map((plan, index) => {
              const isSelected = selectedPlanId === plan._id;
              const badge = getPlanBadge(plan, index);
              const durationLabel = getPlanDurationLabel(plan);
              const basePrice = (plan.priceCents / 100).toFixed(0);
              const basePriceLabel = `${(plan.priceCents / 100).toFixed(2)} EGP`;
              const vatLabel = `${((plan.vatCents || plan.priceCents * 0.14) / 100).toFixed(2)} EGP`;
              const totalLabel = `${((plan.totalCents || plan.priceCents * 1.14) / 100).toFixed(2)} EGP`;

              return (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  className={`rounded-3xl bg-[#121212] overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col justify-between group ${
                    isSelected
                      ? "border-[#e50914] shadow-[0_0_35px_rgba(229,9,20,0.2)] scale-[1.02] ring-1 ring-[#e50914]"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-[#151515]"
                  }`}
                >
                  <div>
                    {/* Top Premium Banner for 3 Months / Popular Plan */}
                    {badge && (
                      <div className="relative overflow-hidden bg-gradient-to-l from-[#e50914] via-[#c2070f] to-[#8b0000] text-white text-center py-4 px-6">
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite]" />
                        <span className="relative text-lg font-black tracking-wide drop-shadow-md">
                          {badge}
                        </span>
                      </div>
                    )}

                    {/* Card Header Box */}
                    <div
                      className={`p-6 border-b border-zinc-800 ${
                        isSelected
                          ? "bg-gradient-to-b from-red-950/40 to-transparent"
                          : "bg-zinc-900/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            {durationLabel}
                          </p>
                        </div>

                        {/* Selection Radio Circle */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isSelected
                              ? "bg-[#e50914] border-[#e50914] text-white shadow-md"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Price Header */}
                      <div className="mt-5 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-white">
                          {basePrice}
                        </span>
                        <span className="text-zinc-400 text-xs font-medium">
                          جنيه مصري
                        </span>
                      </div>
                    </div>

                    {/* Feature Rows */}
                    <div className="p-6 space-y-3 text-xs text-zinc-400">
                      <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                        <span>سعر الخطة الأساسي:</span>
                        <span className="text-zinc-200 font-semibold">
                          {basePriceLabel}
                        </span>
                      </div>

                      <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                        <span>
                          الضرائب والرسوم ({plan.vatPercent || 14}% VAT):
                        </span>
                        <span className="text-zinc-300 font-semibold">
                          {vatLabel}
                        </span>
                      </div>

                      <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center font-bold text-[#e50914]">
                        <span>الإجمالي الكلي:</span>
                        <span className="text-base">{totalLabel}</span>
                      </div>

                      {/* Custom Features from backend */}
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feat, fi) => {
                          const parts = feat.split(":");
                          if (parts.length === 2) {
                            return (
                              <div
                                key={fi}
                                className="py-2 border-b border-zinc-800/60 flex justify-between items-center last:border-b-0"
                              >
                                <span>{parts[0].trim()}:</span>
                                <span className="text-zinc-200">
                                  {parts[1].trim()}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={fi}
                              className="py-1.5 flex items-center gap-2"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-zinc-200">{feat}</span>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                            <span>الجودة:</span>
                            <span className="text-zinc-200">FHD 1080p</span>
                          </div>
                          <div className="py-2 border-b border-zinc-800/60 flex justify-between items-center">
                            <span>الوصول:</span>
                            <span className="text-zinc-200">
                              وصول لكافة المشاريع والحلقات المقفولة
                            </span>
                          </div>
                          <div className="py-2 flex justify-between items-center">
                            <span>الأجهزة:</span>
                            <span className="text-zinc-200">
                              جميع الأجهزة (الهاتف، التابلت، الشاشة)
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer Status */}
                  <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-[#e50914]" : "text-zinc-500"
                      }`}
                    >
                      {isSelected
                        ? "الخطة المختارة حالياً"
                        : "اضغط لاختيار الخطة"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 3rd Card — 1-Year Locked Card (Upcoming) if not present */}
            {plans.length < 3 && (
              <div className="rounded-3xl bg-[#121212] border border-zinc-800/80 overflow-hidden opacity-70 cursor-not-allowed select-none flex flex-col justify-between">
                <div className="p-6 bg-zinc-900/60 border-b border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-zinc-300">
                      اشتراك سنة كاملة
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-amber-400 font-bold text-xs border border-zinc-700">
                      قريباً
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">12 شهر وصول غير محدود</p>
                </div>

                <div className="p-6 space-y-4 text-xs text-zinc-400 flex-1 flex flex-col justify-center">
                  <div className="py-2 border-b border-zinc-800/60 flex justify-between">
                    <span>حالة الخطة:</span>
                    <span className="text-amber-400 font-semibold">
                      متاحة قريباً
                    </span>
                  </div>
                  <div className="py-2 border-b border-zinc-800/60 flex justify-between">
                    <span>الجودة:</span>
                    <span className="text-zinc-300">Ultra HD 4K</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>الوصول:</span>
                    <span className="text-zinc-300">
                      وصول كامل بدون حد أقصى
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                  <p className="text-xs text-zinc-500 font-medium">
                    ستكون هذه الخطة متاحة قريباً جداً
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 - Invoice Breakdown & Instant Pay */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e50914] block mb-1">
                STEP 2 OF 2
              </span>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>ملخص الفاتورة وإتمام الدفع</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                سيتم تحويلك مباشرة إلى بوابة Paymob الآمنة لإتمام عملية الدفع.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center gap-2 font-bold">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {selectedPlan ? (
              <div className="space-y-5 text-xs">
                {/* Plan Badge Box */}
                <div className="p-4 rounded-2xl bg-black border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    الخطة المختارة
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-base">
                      {selectedPlan.name}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-red-600/20 text-red-500 font-bold border border-red-600/30">
                      {getPlanDurationLabel(selectedPlan)}
                    </span>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>اشتراك الخطة الأساسي:</span>
                    <span className="font-semibold text-white">
                      {(selectedPlan.priceCents / 100).toFixed(2)} EGP
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>
                      الضرائب والرسوم ({selectedPlan.vatPercent || 14}% VAT):
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {(
                        (selectedPlan.vatCents ||
                          selectedPlan.priceCents * 0.14) / 100
                      ).toFixed(2)}{" "}
                      EGP
                    </span>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-white">
                      الإجمالي المستحق للدفع:
                    </span>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-[#e50914]">
                        {(
                          (selectedPlan.totalCents ||
                            selectedPlan.priceCents * 1.14) / 100
                        ).toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 block font-normal">
                        جنيه مصري (EGP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit / Pay Button */}
                <div className="pt-6 border-t border-zinc-800/80">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loading || !selectedPlan}
                    className="w-full h-14 bg-[#e50914] hover:bg-[#b9090b] text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري التحويل لبوابة Paymob...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          متابعة الدفع
                          {selectedPlan
                            ? ` (${((selectedPlan.totalCents || selectedPlan.priceCents * 1.14) / 100).toFixed(2)} EGP)`
                            : ""}
                        </span>
                        <svg
                          className="w-5 h-5 rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-zinc-800 text-center">
                  <p className="text-xs font-semibold text-zinc-400 mb-3">
                    الدفع مشفر وآمن 100% بواسطة Paymob
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-300 font-medium">
                    <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">
                      Visa / Mastercard
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">
                      Vodafone Cash
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black border border-zinc-800">
                      Valu
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-8">
                يرجى اختيار خطة اشتراك
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Platform Footer */}
      <Footer />
    </div>
  );
}
