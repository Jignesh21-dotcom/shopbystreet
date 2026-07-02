'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpClient() {
  const [email, setEmail] = useState('');
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          isShopOwner: role === 'owner',
        },
      },
    });

    if (error) {
      setError(error.message || 'Unable to create your account. Please try again.');
    } else {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setUsername('');
      setRole('member');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12 text-gray-900">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        {success ? (
          <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-3xl font-extrabold text-gray-950">
              Account Created
            </h1>

            <p className="text-gray-600">
              Your account has been created successfully. Please check your
              email and confirm your account before signing in.
            </p>

            <p className="mt-5 text-sm text-gray-600">
              Already confirmed?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:underline"
              >
                Log in here
              </Link>
              .
            </p>
          </section>
        ) : (
          <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
            <p className="mb-2 text-center text-sm font-bold uppercase tracking-widest text-blue-700">
              LocalStreetShop Account
            </p>

            <h1 className="mb-3 text-center text-3xl font-extrabold text-gray-950">
              Sign Up
            </h1>

            <p className="mb-6 text-center text-gray-600">
              Create your LocalStreetShop account. Join as a member or register
              as a shop owner to manage your local business.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    role === 'member'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-bold">Member</span>
                  <span className="mt-1 block text-xs">
                    Browse and discover local shops.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    role === 'owner'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-bold">Shop Owner</span>
                  <span className="mt-1 block text-xs">
                    Claim and manage your business.
                  </span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

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
                {loading
                  ? 'Creating Account...'
                  : `Sign Up as ${role === 'owner' ? 'Shop Owner' : 'Member'}`}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
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