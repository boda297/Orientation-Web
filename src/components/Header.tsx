'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { getAccessToken, clearAuthCookies } from '@/lib/auth';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const isValid = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    setIsLoggedIn(!!isValid);
    if (isValid) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'ADMIN' || payload.role === 'admin' || payload.role === 'superadmin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error('Failed to decode token for role check', e);
      }
    }
    setHasMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuthCookies();
    setIsLoggedIn(false);
    router.push('/login');
    router.refresh();
  };

  const handleProtectedNav = (e: React.MouseEvent, href: string) => {
    if (!hasMounted) return;
    const token = getAccessToken();
    const isValid = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    if (!isValid) {
      e.preventDefault();
      setMobileMenuOpen(false);
      setShowAuthModal(true);
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
                <span className="text-white font-bold text-base md:text-lg tracking-wide">Orientation</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-6 flex-1">
              <Link href="/" className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                About Us
              </Link>
              <Link href="/areas" onClick={(e) => handleProtectedNav(e, '/areas')} className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                Area
              </Link>
              <Link href="/news" onClick={(e) => handleProtectedNav(e, '/news')} className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                News
              </Link>
              <Link href="/courses" onClick={(e) => handleProtectedNav(e, '/courses')} className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                Courses
              </Link>
              <Link href="/tv" onClick={(e) => handleProtectedNav(e, '/tv')} className="text-white hover:text-red-600 transition-colors text-sm lg:text-base">
                TV
              </Link>
            </nav>

            {/* Right section (Search + Bookmark + Auth + Mobile Menu) */}
            <div className="flex items-center justify-end flex-1 gap-1 md:gap-2">
              <button onClick={(e) => { handleProtectedNav(e as any, '/saved'); if (isLoggedIn) router.push('/saved'); }} className="text-white hover:text-red-600 transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button onClick={(e) => { handleProtectedNav(e as any, '/search'); if (isLoggedIn) router.push('/search'); }} className="text-white hover:text-red-600 transition-colors p-2 md:mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Admin Dashboard Button */}
              {hasMounted && isAdmin && (
                <Link href="/dashboard" className="text-white hover:text-red-600 transition-colors p-2 md:mr-2 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-800 rounded-full" title="Admin Dashboard">
                  <LayoutDashboard className="w-5 h-5 md:w-5 md:h-5" />
                </Link>
              )}

              {/* Auth Buttons */}
              {hasMounted && (
                isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-red-600 border border-transparent rounded-full transition-colors"
                    title="Log out"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#ff0000] hover:bg-red-700 border border-transparent rounded-full transition-colors"
                  >
                    Log in
                  </Link>
                )
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-3">
              <Link href="/" className="block text-white hover:text-red-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="block text-white hover:text-red-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/areas" className="block text-white hover:text-red-600 transition-colors py-2" onClick={(e) => { handleProtectedNav(e, '/areas'); setMobileMenuOpen(false); }}>
                Area
              </Link>
              <Link href="/news" className="block text-white hover:text-red-600 transition-colors py-2" onClick={(e) => { handleProtectedNav(e, '/news'); setMobileMenuOpen(false); }}>
                News
              </Link>
              <Link href="/courses" className="block text-white hover:text-red-600 transition-colors py-2" onClick={(e) => { handleProtectedNav(e, '/courses'); setMobileMenuOpen(false); }}>
                Courses
              </Link>
              <Link href="/tv" className="block text-white hover:text-red-600 transition-colors py-2" onClick={(e) => { handleProtectedNav(e, '/tv'); setMobileMenuOpen(false); }}>
                TV
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            setIsModalClosing(true);
            setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); }, 300);
          }}
          style={{ animation: isModalClosing ? 'authFadeOut 0.3s ease-in forwards' : 'authFadeIn 0.3s ease-out' }}
        >
          <div
            className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-[2rem] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative text-center"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: isModalClosing ? 'authZoomOut 0.3s ease-in forwards' : 'authZoomIn 0.3s ease-out' }}
          >
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Login Required</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              You need to log in to your account first in order to interact and access all project features.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsModalClosing(true);
                  setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); router.push('/login'); }, 300);
                }}
                className="w-full h-14 bg-[#ff0000] shadow-[0_0_20px_rgba(255,0,0,0.2)] text-white font-bold rounded-full hover:bg-red-700 transition-colors"
              >
                Okay, Log in
              </button>
              <button
                onClick={() => {
                  setIsModalClosing(true);
                  setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); }, 300);
                }}
                className="w-full h-14 bg-[#1a1a1a] border border-zinc-800 text-gray-300 font-medium rounded-full hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframe animations */}
      <style jsx global>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes authZoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes authZoomOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
      `}</style>
    </>
  );
}
