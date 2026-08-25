"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { tokenStorage } from "@/lib/http/tokenStorage";
import { signOut } from "@/lib/api/auth.api";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const isValid = tokenStorage.isValid();
      setIsLoggedIn(isValid);
      if (isValid) {
        const payload = tokenStorage.getUserPayload();
        if (
          payload &&
          (payload.role === "admin" || payload.role === "superadmin")
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setHasMounted(true);
    };

    checkAuth();

    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Ignore errors on signout
    } finally {
      tokenStorage.clear();
      setIsLoggedIn(false);
      setIsAdmin(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800/30">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/assets/logo/logo.png"
                  alt="Orientation Logo"
                  width={50}
                  height={50}
                  className="h-10 w-10 md:h-12 md:w-12 object-contain"
                  priority
                />
                <span className="text-white font-bold text-base md:text-lg tracking-wide">
                  Orientation
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center gap-3 lg:gap-6 flex-1">
              <Link
                href="/"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                href="/areas"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                Area
              </Link>
              <Link
                href="/news"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                News
              </Link>
              <Link
                href="/courses"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                Courses
              </Link>
              <Link
                href="/tv"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                TV
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                About Us
              </Link>
              <Link
                href="/checkout"
                className="text-white hover:text-red-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                Pricing
              </Link>
            </nav>

            {/* Right section (Search + Bookmark + Auth + Mobile Menu) */}
            <div className="flex items-center justify-end flex-1 gap-1 md:gap-2">
              <Link
                href="/saved"
                className="text-white hover:text-red-600 transition-colors p-2"
                title="Saved Projects"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </Link>
              <Link
                href="/search"
                className="text-white hover:text-red-600 transition-colors p-2 md:mr-2"
                title="Search"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Link>

              {/* Admin Dashboard Button */}
              {hasMounted && isAdmin && (
                <Link
                  href="/dashboard"
                  className="text-white hover:text-red-600 transition-colors p-2 md:mr-2 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-800 rounded-full"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5 md:w-5 md:h-5" />
                </Link>
              )}

              {/* Auth Buttons */}
              {hasMounted &&
                (isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="hidden lg:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-red-600 border border-transparent rounded-full transition-colors"
                    title="Log out"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="hidden lg:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#ff0000] hover:bg-red-700 border border-transparent rounded-full transition-colors"
                  >
                    Log in
                  </Link>
                ))}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 space-y-3">
              <Link
                href="/"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/areas"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Area
              </Link>
              <Link
                href="/news"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                href="/courses"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/tv"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                TV
              </Link>
              <Link
                href="/about"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/checkout"
                className="block text-white hover:text-red-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {/* Mobile Auth Buttons */}
              {hasMounted && (
                <div className="pt-4 border-t border-gray-800">
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left text-white hover:text-red-600 transition-colors py-2"
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block text-white hover:text-red-600 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in / Register
                    </Link>
                  )}
                </div>
              )}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
