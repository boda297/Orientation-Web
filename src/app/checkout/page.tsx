"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tokenStorage } from "@/lib/http/tokenStorage";
import { subscriptionPlansApi } from "@/lib/api/subscription-plan.api";
import { subscriptionApi } from "@/lib/api/subscription.api";
import type { SubscriptionPlan } from "@/types/subscription-plan.types";

const translations = {
  ar: {
    langLabel: "العربية",
    step1: "STEP 1 OF 2",
    step1Title: "اختر الخطة المناسبة لك",
    step1Subtitle: "بدون عقود، يمكنك الإلغاء أو التغيير في أي وقت.",
    freeTitle: "Free",
    freeSubtitle: "محتوى مجاني متاح دائماً",
    freePrice: "0",
    freePriceUnit: "جنيه مصري / مجاناً",
    freeFeatures: [
      "1- مشاهدة الأورينتيشن المجانية",
      "2- مشاهدة الريلز",
      "3- طلب عروض المطاعم",
      "4- حجز الحفلات الخاصة",
    ],
    quality: "الجودة:",
    qualityFree: "HD 720p",
    qualityPro: "FHD 1080p",
    devices: "الأجهزة:",
    devicesVal: "جميع الأجهزة",
    selectedPlanStatus: "الخطة المختارة حالياً",
    selectPlanAction: "اضغط لاختيار الخطة",
    proFeatures: [
      "1- مشاهدة جميع الأورينتيشن",
      "2- مشاهدة الأورينتيشن الحصرية",
      "3- تحميل سيلز فيديو للكامبين",
      "4- عروض المطاعم والحفلات",
    ],
    badge3m: "بجنيه في اليوم",
    duration3m: "3 شهور وصول كامل",
    duration6m: "6 شهور وصول كامل",
    planName3m: "اشتراك 3 شهور",
    planName6m: "اشتراك 6 شهور",
    currency: "جنيه مصري",
    basePrice: "سعر الخطة الأساسي:",
    vat: "الضرائب والرسوم (14% VAT):",
    total: "الإجمالي الكلي:",
    step2: "STEP 2 OF 2",
    step2Title: "ملخص الفاتورة وإتمام الدفع",
    step2Subtitle: "سيتم تحويلك مباشرة إلى بوابة Paymob الآمنة لإتمام عملية الدفع.",
    activeSubTitle: "أنت مشترك بالفعل في باقة سارية",
    activeSubDesc: "حسابك مفعل حالياً ولديك وصول كامل لكافة المحتويات.",
    watchBtn: "الانتقال لمشاهدة الفيديوهات ←",
    alreadySubscribedError: "أنت مشترك بالفعل في باقة سارية. يمكنك الاستمتاع بجميع المحتويات الآن دون الحاجة لشراء باقة جديدة.",
    paymobError: "تعذر الاتصال ببوابة الدفع، حاول مرة أخرى",
    invalidPlanError: "برجاء اختيار خطة اشتراك صالحة أولاً.",
    noUrlError: "لم يتم استلام رابط الدفع من الخادم.",
    freeActiveTitle: "الباقة المجانية مفعّلة تلقائياً",
    freeActiveDesc: "يمكنك تصفح ومشاهدة جميع الأورينتيشن المجانية والريلز فوراً دون الحاجة لأي عملية دفع.",
    exploreBtn: "تصفح الأورينتيشن الآن ←",
    selectedPlanLabel: "الخطة المختارة",
    invoiceBase: "اشتراك الخطة الأساسي:",
    invoiceVat: "الضرائب والرسوم",
    invoiceTotal: "الإجمالي المستحق للدفع:",
    currencyCode: "جنيه مصري (EGP)",
    proceedPay: "متابعة الدفع",
    redirecting: "جاري التحويل لبوابة Paymob...",
    trustBadge: "الدفع مشفر وآمن 100% بواسطة Paymob",
    pleaseSelectPlan: "يرجى اختيار خطة اشتراك",
  },
  en: {
    langLabel: "English",
    step1: "STEP 1 OF 2",
    step1Title: "Choose the Right Plan for You",
    step1Subtitle: "No contracts, cancel or change your plan at any time.",
    freeTitle: "Free",
    freeSubtitle: "Free content available forever",
    freePrice: "0",
    freePriceUnit: "EGP / Free",
    freeFeatures: [
      "1- Watch Free Orientations",
      "2- Watch Reels",
      "3- Request Restaurant Offers",
      "4- Book Private Events",
    ],
    quality: "Quality:",
    qualityFree: "HD 720p",
    qualityPro: "FHD 1080p",
    devices: "Devices:",
    devicesVal: "All Devices",
    selectedPlanStatus: "Currently Selected Plan",
    selectPlanAction: "Click to select this plan",
    proFeatures: [
      "1- Watch All Orientations",
      "2- Watch Exclusive Orientations",
      "3- Download Sales Videos for Campaigns",
      "4- Restaurant & Events Offers",
    ],
    badge3m: "1 EGP Per Day",
    duration3m: "3 Months Full Access",
    duration6m: "6 Months Full Access",
    planName3m: "3 Months Subscription",
    planName6m: "6 Months Subscription",
    currency: "EGP",
    basePrice: "Base Plan Price:",
    vat: "Taxes & Fees (14% VAT):",
    total: "Total Amount:",
    step2: "STEP 2 OF 2",
    step2Title: "Invoice Summary & Checkout",
    step2Subtitle: "You will be redirected directly to Paymob's secure gateway to complete payment.",
    activeSubTitle: "You already have an active subscription",
    activeSubDesc: "Your account is active with unlimited access to all content.",
    watchBtn: "Go to Videos →",
    alreadySubscribedError: "You already have an active subscription. Enjoy unlimited access without needing a new purchase.",
    paymobError: "Could not connect to payment gateway. Please try again.",
    invalidPlanError: "Please select a valid subscription plan first.",
    noUrlError: "Payment URL was not received from the server.",
    freeActiveTitle: "Free Plan is Active",
    freeActiveDesc: "You can explore and watch all free orientations and reels immediately without any payment.",
    exploreBtn: "Explore Orientations Now →",
    selectedPlanLabel: "Selected Plan",
    invoiceBase: "Base Subscription:",
    invoiceVat: "Taxes & Fees",
    invoiceTotal: "Total Due for Payment:",
    currencyCode: "Egyptian Pounds (EGP)",
    proceedPay: "Proceed to Pay",
    redirecting: "Redirecting to Paymob Gateway...",
    trustBadge: "100% Encrypted & Secure Payment via Paymob",
    pleaseSelectPlan: "Please select a subscription plan",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const t = translations[lang];

  const [, setIsAuthenticated] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any | null>(null);

  // Check auth and current subscription on mount
  useEffect(() => {
    const authenticated = tokenStorage.isValid();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      subscriptionApi
        .getMySubscription()
        .then((res) => {
          if (res?.subscription?.status === "active") {
            setActiveSubscription(res.subscription);
          }
        })
        .catch(() => {});
    }
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

  const selectedPlan =
    plans.find((p) => p._id === selectedPlanId) ||
    (selectedPlanId === "free" ? null : plans[0]);

  // Checkout handler (Preserves 100% of Paymob logic)
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
      setErrorMessage(t.invalidPlanError);
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
        throw new Error(t.noUrlError);
      }
    } catch (err: any) {
      console.warn("[Checkout Note]:", err?.message);
      const rawMsg = (err?.message || "").toLowerCase();
      if (
        rawMsg.includes("already have an active subscription") ||
        rawMsg.includes("active subscription")
      ) {
        setErrorMessage(t.alreadySubscribedError);
      } else {
        setErrorMessage(err?.message || t.paymobError);
      }
      setLoading(false);
    }
  };

  // Helper to extract duration label
  const getPlanDurationLabel = (plan: SubscriptionPlan) => {
    if (lang === "en") {
      if (plan.durationDays === 90) return t.duration3m;
      if (plan.durationDays === 180) return t.duration6m;
      if (plan.durationDays === 365) return "12 Months Unlimited Access";
      return `${plan.durationDays} Days Full Access`;
    }
    if (plan.durationDays === 90) return "3 شهور وصول كامل";
    if (plan.durationDays === 180) return "6 شهور وصول كامل";
    if (plan.durationDays === 365) return "12 شهر وصول غير محدود";
    return `${plan.durationDays} يوم وصول كامل`;
  };

  const getPlanName = (plan: SubscriptionPlan) => {
    if (lang === "en") {
      if (plan.durationDays === 90 || plan.code === "plan_3_months") return t.planName3m;
      if (plan.durationDays === 180 || plan.code === "plan_6_months") return t.planName6m;
      return plan.name || `${plan.durationDays} Days Plan`;
    }
    return plan.name || (plan.durationDays === 90 ? "اشتراك 3 شهور" : "اشتراك 6 شهور");
  };

  const getPlanBadge = (plan: SubscriptionPlan, index: number) => {
    if (
      plan.durationDays === 90 ||
      plan.code === "plan_3_months" ||
      index === 0
    ) {
      return t.badge3m;
    }
    return "";
  };

  return (
    <div
      className={`min-h-screen bg-black text-white selection:bg-[#e50914] selection:text-white transition-all duration-300 ${
        lang === "ar" ? "dir-rtl" : "dir-ltr"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Platform Header */}
      <Header />

      {/* Main Container */}
      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Language Switcher Bar */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex p-1 bg-zinc-900/90 border border-zinc-800 rounded-full shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                lang === "ar"
                  ? "bg-[#e50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                lang === "en"
                  ? "bg-[#e50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e50914] block mb-2">
            {t.step1}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.step1Title}
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            {t.step1Subtitle}
          </p>
        </div>

        {/* ── Plans Loading State ────────────────────────────────────────── */}
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-[#121212] border border-zinc-800 h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          /* ── Plan Cards Grid (3 Columns: Free -> 3 Months Pro -> 6 Months Pro) ── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
            {/* 1. Free Plan Card */}
            <div
              onClick={() => setSelectedPlanId("free")}
              className={`rounded-3xl bg-[#121212] overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col justify-between group ${
                selectedPlanId === "free"
                  ? "border-[#e50914] shadow-[0_0_35px_rgba(229,9,20,0.2)] scale-[1.02] ring-1 ring-[#e50914]"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-[#151515]"
              }`}
            >
              <div>
                {/* Card Header Box */}
                <div
                  className={`p-6 border-b border-zinc-800 ${
                    selectedPlanId === "free"
                      ? "bg-gradient-to-b from-red-950/40 to-transparent"
                      : "bg-zinc-900/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                        {t.freeTitle}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {t.freeSubtitle}
                      </p>
                    </div>

                    {/* Selection Radio Circle */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        selectedPlanId === "free"
                          ? "bg-[#e50914] border-[#e50914] text-white shadow-md"
                          : "border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      {selectedPlanId === "free" && (
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
                      {t.freePrice}
                    </span>
                    <span className="text-zinc-400 text-xs font-medium">
                      {t.freePriceUnit}
                    </span>
                  </div>
                </div>

                {/* Feature Rows */}
                <div className="p-6 space-y-0 text-xs text-zinc-400">
                  {t.freeFeatures.map((feat, fi) => (
                    <div
                      key={fi}
                      className="flex items-center gap-2.5 py-3 border-b border-zinc-800"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-400 flex-shrink-0"
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
                      <span className="text-zinc-200 font-medium">{feat}</span>
                    </div>
                  ))}

                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-[11px] text-zinc-400">
                      <span>{t.quality}</span>
                      <span className="text-zinc-200 font-semibold">
                        {t.qualityFree}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 text-[11px] text-zinc-400">
                      <span>{t.devices}</span>
                      <span className="text-zinc-200 font-semibold">
                        {t.devicesVal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Status */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                <span
                  className={`text-xs font-semibold ${
                    selectedPlanId === "free" ? "text-[#e50914]" : "text-zinc-500"
                  }`}
                >
                  {selectedPlanId === "free"
                    ? t.selectedPlanStatus
                    : t.selectPlanAction}
                </span>
              </div>
            </div>

            {/* 2 & 3. Pro Plans (3 Months and 6 Months) */}
            {plans.map((plan, index) => {
              const isSelected = selectedPlanId === plan._id;
              const badge = getPlanBadge(plan, index);
              const durationLabel = getPlanDurationLabel(plan);
              const planTitle = getPlanName(plan);
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
                            {planTitle}
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
                          {t.currency}
                        </span>
                      </div>
                    </div>

                    {/* Feature Rows */}
                    <div className="p-6 space-y-0 text-xs text-zinc-400">
                      {t.proFeatures.map((feat, fi) => (
                        <div
                          key={fi}
                          className="flex items-center gap-2.5 py-3 border-b border-zinc-800"
                        >
                          <svg
                            className="w-4 h-4 text-emerald-400 flex-shrink-0"
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
                          <span className="text-zinc-200 font-medium">
                            {feat}
                          </span>
                        </div>
                      ))}

                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-800">
                          <span>{t.basePrice}</span>
                          <span className="text-zinc-200 font-semibold">
                            {basePriceLabel}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2.5 border-b border-zinc-800">
                          <span>{t.vat}</span>
                          <span className="text-zinc-300 font-semibold">
                            {vatLabel}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2.5 font-bold text-[#e50914]">
                          <span>{t.total}</span>
                          <span className="text-base font-black">
                            {totalLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Status */}
                  <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-[#e50914]" : "text-zinc-500"
                      }`}
                    >
                      {isSelected ? t.selectedPlanStatus : t.selectPlanAction}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 2 - Invoice Breakdown & Instant Pay */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e50914] block mb-1">
                {t.step2}
              </span>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>{t.step2Title}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {t.step2Subtitle}
              </p>
            </div>

            {activeSubscription && !errorMessage && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-start gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-bold text-emerald-200 text-sm">
                    {t.activeSubTitle}
                  </p>
                  <p className="text-zinc-300 mt-1 text-xs">
                    {t.activeSubDesc}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all text-xs"
                  >
                    {t.watchBtn}
                  </Link>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl text-xs flex items-start gap-3 ${
                  errorMessage.includes("مشترك بالفعل") ||
                  errorMessage.includes("already have an active subscription")
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {errorMessage.includes("مشترك بالفعل") ||
                errorMessage.includes("already have an active subscription") ? (
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
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
                )}
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                  {(errorMessage.includes("مشترك بالفعل") ||
                    errorMessage.includes("already have an active subscription")) && (
                    <div className="mt-2.5">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold transition-all text-xs"
                      >
                        {t.watchBtn}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedPlanId === "free" ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t.freeActiveTitle}
                </h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                  {t.freeActiveDesc}
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-600/30"
                  >
                    {t.exploreBtn}
                  </Link>
                </div>
              </div>
            ) : selectedPlan ? (
              <div className="space-y-5 text-xs">
                {/* Plan Badge Box */}
                <div className="p-4 rounded-2xl bg-black border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    {t.selectedPlanLabel}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-base">
                      {getPlanName(selectedPlan)}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-red-600/20 text-red-500 font-bold border border-red-600/30">
                      {getPlanDurationLabel(selectedPlan)}
                    </span>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>{t.invoiceBase}</span>
                    <span className="font-semibold text-white">
                      {(selectedPlan.priceCents / 100).toFixed(2)} EGP
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400 text-sm">
                    <span>
                      {t.invoiceVat} ({selectedPlan.vatPercent || 14}% VAT):
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
                      {t.invoiceTotal}
                    </span>
                    <div className={lang === "ar" ? "text-left" : "text-right"}>
                      <span className="text-2xl font-bold text-[#e50914]">
                        {(
                          (selectedPlan.totalCents ||
                            selectedPlan.priceCents * 1.14) / 100
                        ).toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 block font-normal">
                        {t.currencyCode}
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
                        <span>{t.redirecting}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {t.proceedPay}
                          {selectedPlan
                            ? ` (${((selectedPlan.totalCents || selectedPlan.priceCents * 1.14) / 100).toFixed(2)} EGP)`
                            : ""}
                        </span>
                        <svg
                          className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`}
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
                    {t.trustBadge}
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
                {t.pleaseSelectPlan}
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
