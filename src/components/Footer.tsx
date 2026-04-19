'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(getApiUrl('/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Successfully subscribed!');
        setEmail(''); // Clear input
      } else {
        // Backend error (e.g. 404 route not found)
        let errorMessage = 'Failed to subscribe. API not ready.';
        const errorText = await res.text().catch(() => '');
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) errorMessage = parsed.message;
        } catch (e) {
          if (errorText && errorText.length < 100) errorMessage = errorText;
        }
        setStatus('error');
        setMessage(errorMessage);
      }
    } catch (error: any) {
      // Network fetch error
      setStatus('error');
      setMessage('Network error or server is down.');
    } finally {
      // Clear success/error message after 3 seconds
      setTimeout(() => {
        if (status !== 'loading') {
          setStatus('idle');
          setMessage('');
        }
      }, 3000);
    }
  };

  return (
    <footer className="bg-black border-t border-gray-800 py-6 md:py-8">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-red-600">Orientation</h3>
            </div>
            <p className="text-white font-semibold mb-3 text-sm md:text-base">
              Real Estate Video Platform for Developers, Brokers & Sales Agents
            </p>
            <p className="text-gray-400 mb-3 text-sm md:text-base">
              Orientation is the first video platform designed for the real estate industry. Developers showcase their projects, and brokers & sales agents can access on-demand orientations anytime, anywhere. Save time, focus on the right projects, and stay ahead in the market.
            </p>
            <p className="text-white mb-2 text-sm md:text-base">Email us: <a href="mailto:marketing@orientationre.com" className="text-red-600 hover:underline">marketing@orientationre.com</a></p>
            <p className="text-white text-sm md:text-base">Helpline number: <span className="font-bold">+(20) 105 521 9636</span></p>
          </div>

          <div>
            <h3 className="text-white text-lg md:text-xl font-semibold mb-3">Subscribe Newsletter</h3>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600 text-sm md:text-base disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold rounded-lg transition-colors text-sm md:text-base whitespace-nowrap flex items-center justify-center min-w-[140px]"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'SUBSCRIBE'
                  )}
                </button>
              </div>
              {/* Status Message */}
              {message && (
                <p className={`text-sm mt-1 transition-all duration-300 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <p className="text-gray-400 text-sm text-center">
            © 2025 <span className="text-red-600">AlRawaabit</span>. All Rights Reserved. All videos and shows on this platform are trademarks of, and all related images and content are the property of, Aziz Film. Duplication and copy of this is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
}
