"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import AuthLogo from "@/components/AuthLogo";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import { login } from "@/lib/api/auth.api";
import { tokenStorage } from "@/lib/http/tokenStorage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const submittedEmail = ((formData.get("email") as string) || email || "").trim();
    const submittedPassword = (formData.get("password") as string) || password || "";

    if (!submittedEmail) {
      return setError("Please enter your email address.");
    }
    if (!submittedPassword) {
      return setError("Please enter your password.");
    }
    if (submittedPassword.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    setLoading(true);
    setError("");
    try {
      const res = await login({ email: submittedEmail, password: submittedPassword });
      const hasToken = tokenStorage.isValid() || res?.accessToken || (res as any)?.token;
      
      if (hasToken) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-change"));
          window.location.href = "/";
        } else {
          router.push("/");
        }
      } else {
        setError("Login completed but session could not be established. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <AuthLogo />

      <h1 className="text-3xl font-bold mb-3 mt-4">Log in</h1>
      <p className="text-gray-400 text-sm mb-6">
        Enter your email and password to start easily following Orientation real
        estate projects.
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3.5 rounded-2xl mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Email */}
        <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
          <Mail className="absolute left-4 w-5 h-5 text-gray-500" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-full bg-transparent pl-12 pr-4 text-white outline-none placeholder:text-gray-600"
            placeholder="Email"
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
            <Lock className="absolute left-4 w-5 h-5 text-gray-500" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-full bg-transparent pl-12 pr-12 text-white outline-none placeholder:text-gray-600"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 p-1 group"
            >
              {showPassword ? (
                <Eye className="w-5 h-5 text-gray-400 group-hover:text-white" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-white" />
              )}
            </button>
          </div>

          <div className="flex justify-end mt-3">
            <Link
              href="/forgot-password"
              className="text-[#ff0000] text-sm font-medium hover:underline"
            >
              Forgot password
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-14 bg-[#ff0000] hover:bg-[#d40000] text-white rounded-2xl font-semibold flex items-center justify-center transition-all duration-200 shadow-md shadow-red-950/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-zinc-800" />
          <span className="absolute bg-black px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            or
          </span>
        </div>

        {/* Social Logins (Apple, Google, Facebook) */}
        <SocialAuthButtons
          actionText="signin"
          onError={(msg) => setError(msg)}
        />

        <p className="text-center text-sm text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#ff0000] font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
