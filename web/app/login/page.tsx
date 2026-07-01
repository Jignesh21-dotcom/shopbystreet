'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) router.push('/profile');
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
      setShowReset(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (showReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) setMessage(`❌ ${error.message}`);
      else setMessage('✅ Reset link sent! Check your email.');

      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            isShopOwner: role === 'owner',
            shopStatus: role === 'owner' ? 'pendingPayment' : null,
          },
        },
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Sign-up successful! Please check your email to confirm.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Logged in successfully! Redirecting...');
        setTimeout(() => router.push('/profile'), 1200);
      }
    }
  };

  const pageTitle = showReset
    ? 'Reset Password | LocalStreetShop'
    : isSignUp
    ? 'Create Account | LocalStreetShop'
    : 'Login | LocalStreetShop';

  const pageDescription = showReset
    ? 'Reset your password to regain access to your LocalStreetShop account.'
    : isSignUp
    ? 'Create a LocalStreetShop account as a shopper or shop owner.'
    : 'Log in to access your LocalStreetShop account.';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url="https://www.localstreetshop.com/login"
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2 md:items-center">
          <section className="text-center md:text-left">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop Community
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Welcome to Canada&apos;s Digital Main Street
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              Sign in to review local shops, manage your business, access deals,
              and connect with the LocalStreetShop community.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
    <h2 className="font-bold text-blue-800">🧭 Shoppers</h2>
    <p className="text-sm text-gray-600 mt-1">
      Explore and review local shops.
    </p>
  </div>

  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 shadow-sm">
    <h2 className="font-bold text-green-800">🏪 Owners</h2>
    <p className="text-sm text-gray-600 mt-1">
      Claim listings and manage products.
    </p>
  </div>

  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 shadow-sm">
    <h2 className="font-bold text-purple-800">🤝 Community</h2>
    <p className="text-sm text-gray-600 mt-1">
      Support local businesses.
    </p>
  </div>
</div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">
              {showReset
                ? 'Reset Password'
                : isSignUp
                ? 'Create Account'
                : 'Welcome Back'}
            </h2>

            <p className="text-center text-gray-500 mb-6">
              {showReset
                ? 'Enter your email and we’ll send you a reset link.'
                : isSignUp
                ? 'Join LocalStreetShop as a shopper or shop owner.'
                : 'Log in to continue to your account.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && !showReset && (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('member')}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === 'member'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      👤 Shopper
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        role === 'owner'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      🏪 Shop Owner
                    </button>
                  </div>
                </>
              )}

              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {!showReset && (
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-semibold shadow"
              >
                {showReset ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Login'}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 text-center px-4 py-3 rounded-xl text-sm font-semibold ${
                  message.includes('✅')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            {!showReset && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowReset(true)}
                  className="text-sm text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              {showReset ? (
                <button
                  className="text-blue-600 hover:underline font-semibold text-sm"
                  onClick={() => setShowReset(false)}
                >
                  ← Back to Login
                </button>
              ) : isSignUp ? (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    className="text-blue-600 hover:underline font-semibold"
                    onClick={() => setIsSignUp(false)}
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <button
                    className="text-blue-600 hover:underline font-semibold"
                    onClick={() => setIsSignUp(true)}
                  >
                    Create account
                  </button>
                </p>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-blue-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}