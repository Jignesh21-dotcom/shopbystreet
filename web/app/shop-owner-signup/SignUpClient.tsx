'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpClient() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: username.trim(),
          isShopOwner: role === 'owner',
        },
      },
    });

    if (error) {
      setError(error.message || 'Unable to create your account. Please try again.');
      setLoading(false);
      return;
    }

    setSubmittedEmail(cleanEmail);
    setSuccess(true);
    setEmail('');
    setPassword('');
    setUsername('');
    setRole('member');
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12 text-gray-900">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        {success ? (
          <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✅
            </div>

            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
              Almost there
            </p>

            <h1 className="mb-3 text-3xl font-extrabold text-gray-950">
              Check your email
            </h1>

            <p className="text-gray-600">
              We sent a confirmation link to:
            </p>

            <p className="mt-3 break-words rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
              {submittedEmail}
            </p>

            <p className="mt-5 text-sm leading-6 text-gray-600">
              Please open the email and click the confirmation link to activate
              your LocalStreetShop account. If you do not see it within a few
              minutes, check your Spam or Junk folder.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href="/login"
                className="block w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Go to Login
              </Link>

              <Link
                href="/"
                className="block w-full rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>
          </section>
        ) : (
          <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
            <p className="mb-2 text-center text-sm font-bold uppercase tracking-widest text-blue-700">
              LocalStreetShop Account
            </p>

            <h1 className="mb-3 text-center text-3xl font-extrabold text-gray-950">
              Create Account
            </h1>

            <p className="mb-6 text-center text-gray-600">
              Join LocalStreetShop as a shopper or shop owner.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`rounded-2xl border p-4 text-center transition ${
                    role === 'member'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-bold">👤 Shopper</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`rounded-2xl border p-4 text-center transition ${
                    role === 'owner'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-bold">🏪 Shop Owner</span>
                </button>
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Forgot Password?
            </p>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}