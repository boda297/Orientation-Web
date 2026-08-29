"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth.api";
import { tokenStorage } from "@/lib/http/tokenStorage";

export default function AppleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const id_token = searchParams.get("id_token");

        if (!id_token && !code) {
          // If in popup mode, Apple handles it via postMessage
          return;
        }

        const res = await authApi.loginWithApple({
          identityToken: id_token || "",
          authorizationCode: code || undefined,
        });

        if (res?.accessToken) {
          tokenStorage.setTokens(res.accessToken, res.refreshToken);
          router.push("/");
        }
      } catch (err: any) {
        setError(err.message || "Failed to authenticate with Apple");
      }
    };

    handleCallback();
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
          <p className="text-gray-400 text-sm">Completing Apple sign-in...</p>
        </div>
      )}
    </div>
  );
}
