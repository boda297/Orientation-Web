"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/http/url";

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  actionText?: "signin" | "signup";
}

export default function SocialAuthButtons({
  onSuccess,
  onError,
  actionText = "signin",
}: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"apple" | "google" | "facebook" | null>(null);

  // 🍏 Handle Sign in with Apple (Redirect to Backend OAuth Endpoint)
  const handleAppleSignIn = () => {
    setLoadingProvider("apple");
    try {
      window.location.href = getApiUrl("/auth/apple/login");
    } catch (err: any) {
      setLoadingProvider(null);
      if (onError) onError(err.message || "Failed to initialize Apple sign-in.");
    }
  };

  // 🔍 Handle Google Sign In (Redirect to Backend OAuth Endpoint)
  const handleGoogleSignIn = () => {
    setLoadingProvider("google");
    try {
      window.location.href = getApiUrl("/auth/google/login");
    } catch (err: any) {
      setLoadingProvider(null);
      if (onError) onError(err.message || "Failed to initialize Google sign-in.");
    }
  };

  // 📘 Handle Facebook Sign In (Prepared for backend / App ID)
  const handleFacebookSignIn = () => {
    setLoadingProvider("facebook");
    try {
      const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!fbAppId) {
        throw new Error("Facebook Login is not configured yet.");
      }
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/facebook/callback`);
      const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&scope=email,public_profile`;
      window.location.href = fbAuthUrl;
    } catch (err: any) {
      setLoadingProvider(null);
      if (onError) onError(err.message || "Facebook login failed.");
    }
  };

  const verb = actionText === "signup" ? "Sign up" : "Continue";

  return (
    <div className="flex flex-col gap-3 w-full my-2">
      {/* 🍏 Apple Button (Official Master Apple Vector & Optical Alignment) */}
      <button
        type="button"
        onClick={handleAppleSignIn}
        disabled={loadingProvider !== null}
        className="relative w-full h-13 bg-white hover:bg-zinc-100 text-black font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-60 select-none"
      >
        {loadingProvider === "apple" ? (
          <Loader2 className="w-5 h-5 animate-spin text-black" />
        ) : (
          <>
            {/* Official Master Apple Vector Logo */}
            <svg
              className="w-4.5 h-5 fill-current -translate-y-[1px]"
              viewBox="0 0 814 1000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
            </svg>
            <span className="text-sm font-medium tracking-tight">
              {verb} with Apple
            </span>
          </>
        )}
      </button>

      {/* 🔍 Google Button (Official Guidelines: White/Dark surface with standard Google G badge) */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loadingProvider !== null}
        className="relative w-full h-14 bg-[#111] hover:bg-zinc-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 border border-zinc-800 hover:border-zinc-700 active:scale-[0.99] disabled:opacity-60 select-none"
      >
        {loadingProvider === "google" ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : (
          <>
            {/* Official Google 4-Color SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-sm font-medium tracking-tight text-zinc-200">
              {verb} with Google
            </span>
          </>
        )}
      </button>

      {/* 📘 Facebook Button (Commented out)
      <button
        type="button"
        onClick={handleFacebookSignIn}
        disabled={loadingProvider !== null}
        className="relative w-full h-14 bg-[#111] hover:bg-zinc-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 border border-zinc-800 hover:border-zinc-700 active:scale-[0.99] disabled:opacity-60 select-none"
      >
        {loadingProvider === "facebook" ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-sm font-medium tracking-tight text-zinc-200">
              {verb} with Facebook
            </span>
          </>
        )}
      </button>
      */}
    </div>
  );
}
