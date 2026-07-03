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

  const [signupSuccess, setSignupSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedRole, setSubmittedRole] = useState<'member' | 'owner'>('member');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
const verified = params.get('verified');

if (mode === 'signup') {
  setIsSignUp(true);
  setShowReset(false);
}

if (verified === 'true') {
  setVerifiedSuccess(true);
  setIsSignUp(false);
  setShowReset(false);
}
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setRole('member');
    setMessage(null);
  };

  const goToLogin = () => {
    setSignupSuccess(false);
    setResetSuccess(false);
    setIsSignUp(false);
    setShowReset(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (showReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setResetEmail(cleanEmail);
        setResetSuccess(true);
        setEmail('');
      }

      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
          data: {
            username: username.trim(),
            isShopOwner: role === 'owner',
            shopStatus: role === 'owner' ? 'pendingPayment' : null,
          },
        },
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setSubmittedEmail(cleanEmail);
        setSubmittedRole(role);
        setSignupSuccess(true);
        resetForm();
      }

      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Logged in successfully! Redirecting...');
      setTimeout(() => router.push('/profile'), 1200);
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
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
          <section className="text-center md:text-left">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
              LocalStreetShop Community
            </p>

            <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
              Welcome to Canada&apos;s Digital Main Street
            </h1>

            <p className="mb-6 text-lg text-gray-600">
              Sign in to review local shops, manage your business, access deals,
              and connect with the LocalStreetShop community.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
                <h2 className="font-bold text-blue-800">🧭 Shoppers</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Explore and review local shops.
                </p>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm">
                <h2 className="font-bold text-green-800">🏪 Owners</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Claim listings and manage products.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 shadow-sm">
                <h2 className="font-bold text-purple-800">🤝 Community</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Support local businesses.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {signupSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✅
                </div>

                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
                  Almost there
                </p>

                <h2 className="mb-3 text-3xl font-extrabold text-gray-950">
                  Check your email
                </h2>

                <p className="text-gray-600">
                  We sent a confirmation link to:
                </p>

                <p className="mt-3 break-words rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  {submittedEmail}
                </p>

                <p className="mt-5 text-sm leading-6 text-gray-600">
                  {submittedRole === 'owner'
                    ? 'Confirm your email to start claiming your business, managing your storefront, and adding products on LocalStreetShop.'
                    : 'Confirm your email to start discovering local businesses, exploring streets, and supporting shops in your community.'}
                </p>

                <div className="mt-7 space-y-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="block w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
                  >
                    Go to Login
                  </button>

                  <Link
                    href="/"
                    className="block w-full rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : resetSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✅
                </div>

                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
                  Password reset
                </p>

                <h2 className="mb-3 text-3xl font-extrabold text-gray-950">
                  Check your email
                </h2>

                <p className="text-gray-600">
                  We sent a password reset link to:
                </p>

                <p className="mt-3 break-words rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  {resetEmail}
                </p>

                <p className="mt-5 text-sm leading-6 text-gray-600">
                  Open the email and click the reset button to choose a new
                  password. If you do not see it within a few minutes, check your
                  Spam or Junk folder.
                </p>

                <div className="mt-7 space-y-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="block w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
                  >
                    Back to Login
                  </button>

                  <Link
                    href="/"
                    className="block w-full rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-2 text-center text-3xl font-extrabold text-blue-700">
                  {showReset
                    ? 'Reset Password'
                    : isSignUp
                    ? 'Create Account'
                    : 'Welcome Back'}
                </h2>

                <p className="mb-6 text-center text-gray-500">
                  {showReset
                    ? 'Enter your email and we’ll send you a reset link.'
                    : isSignUp
                    ? 'Join LocalStreetShop as a shopper or shop owner.'
                    : 'Log in to continue to your account.'}
                </p>
                {verifiedSuccess && (
  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
    ✅ Email verified successfully. You can now log in to your LocalStreetShop account.
  </div>
)}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && !showReset && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {!showReset && (
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
                  >
                    {showReset
                      ? 'Send Reset Link'
                      : isSignUp
                      ? 'Create Account'
                      : 'Login'}
                  </button>
                </form>

                {message && (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-semibold ${
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
                      onClick={() => {
                        setShowReset(true);
                        setMessage(null);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  {showReset ? (
                    <button
                      className="text-sm font-semibold text-blue-600 hover:underline"
                      onClick={() => {
                        setShowReset(false);
                        setMessage(null);
                      }}
                    >
                      ← Back to Login
                    </button>
                  ) : isSignUp ? (
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        className="font-semibold text-blue-600 hover:underline"
                        onClick={() => {
                          setIsSignUp(false);
                          setMessage(null);
                        }}
                      >
                        Log in
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Don&apos;t have an account?{' '}
                      <button
                        className="font-semibold text-blue-600 hover:underline"
                        onClick={() => {
                          setIsSignUp(true);
                          setMessage(null);
                        }}
                      >
                        Create account
                      </button>
                    </p>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="text-sm font-semibold text-gray-500 hover:text-blue-700"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}