"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { tokenStorage } from "@/lib/http/tokenStorage";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = searchParams.get("token") || searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (token) {
        tokenStorage.setTokens(token, refreshToken || token);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("accessToken", token);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
          } catch {}
          window.dispatchEvent(new Event("auth-change"));
        }
        router.push("/");
        return;
      }

      const errorMsg = searchParams.get("error") || searchParams.get("message");
      if (errorMsg) {
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete Google sign-in.");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      {error ? (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl max-w-md text-center">
          <p className="font-semibold mb-2">Authentication Error</p>
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-gray-400 text-sm">Completing Google sign-in...</p>
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
