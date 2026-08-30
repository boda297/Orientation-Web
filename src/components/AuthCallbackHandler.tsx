"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/http/tokenStorage";

export default function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (token) {
      // 1. Save access and refresh tokens in both cookie and localStorage
      tokenStorage.setTokens(token, refreshToken || token);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("accessToken", token);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
        } catch {
          // Ignore localStorage access restrictions
        }
        window.dispatchEvent(new Event("auth-change"));

        // 2. Clean URL query parameters smoothly
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        url.searchParams.delete("accessToken");
        url.searchParams.delete("refreshToken");
        window.history.replaceState({}, document.title, url.pathname + (url.search || ""));
      }
    }
  }, [searchParams, router]);

  return null;
}
