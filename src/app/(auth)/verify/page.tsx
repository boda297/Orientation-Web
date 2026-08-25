"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthLogo from "@/components/AuthLogo";
import { tokenStorage } from "@/lib/http/tokenStorage";
import {
  verifyEmail,
  verifyResetOtp,
  resendVerification,
  forgotPassword,
} from "@/lib/api/auth.api";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // get email and purpose from search params
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "register";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // time left for otp to expire
  const [timeLeft, setTimeLeft] = useState(119); // 2:00 in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // if no email is provided, redirect to login page
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  // timer to count down from 2:00 to 0:00
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    // Only take the last character typed to handle easy updates
    const char = value.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next input
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // handle keydown event for otp input
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // handle verify event for otp input
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) return;

    setLoading(true);
    setError("");

    try {
      if (purpose === "reset") {
        await verifyResetOtp({ email, otp: code });
        sessionStorage.setItem("resetEmail", email);
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        const res = await verifyEmail({ email, otp: code });
        if (res.accessToken && res.refreshToken) {
          tokenStorage.setTokens(res.accessToken, res.refreshToken);
          router.push("/");
          router.refresh();
        } else {
          router.push("/login");
        }
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;

    try {
      if (purpose === "reset") {
        await forgotPassword({ email });
      } else {
        await resendVerification({ email });
      }
      setTimeLeft(119); // reset timer to 2:00
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <AuthLogo />

      <h1 className="text-3xl font-bold mt-4 mb-3">Check your email</h1>
      <div className="text-gray-400 text-sm mb-8 leading-relaxed">
        We have sent the code to:
        <br />
        <span className="text-[#ff0000] font-medium">{email}</span>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-16 h-16 bg-transparent border border-zinc-700 rounded-2xl text-center text-2xl text-white font-medium focus:border-white focus:outline-none transition-colors"
          />
        ))}
      </div>

      <div className="flex justify-between items-center mb-8 px-1">
        <div className="text-gray-500 text-sm">
          Code expires in:{" "}
          {Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={timeLeft > 0}
          className={`text-sm font-medium transition-colors ${timeLeft > 0 ? "text-gray-700" : "text-[#ff0000] hover:underline"}`}
        >
          Resend Code
        </button>
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || otp.join("").length < 4}
        className="w-full h-14 bg-zinc-800 text-white rounded-[1.75rem] font-bold flex items-center justify-center transition-colors disabled:opacity-50 hover:bg-zinc-700 mt-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
      </button>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.back()}
          className="text-[#ff0000] text-sm font-semibold hover:underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col animate-in fade-in duration-500 justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
