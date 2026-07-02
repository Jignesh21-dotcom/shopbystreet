'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <SEO
        title="Update Password | LocalStreetShop"
        description="Choose a new password for your LocalStreetShop account."
        url="https://www.localstreetshop.com/update-password"
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✅
              </div>

              <h1 className="mb-3 text-3xl font-extrabold text-gray-950">
                Password Updated
              </h1>

              <p className="text-gray-600">
                Your password has been updated successfully. You can now log in
                with your new password.
              </p>

              <Link
                href="/login"
                className="mt-7 block w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-2 text-center text-sm font-bold uppercase tracking-widest text-blue-700">
                LocalStreetShop Account
              </p>

              <h1 className="mb-3 text-center text-3xl font-extrabold text-gray-950">
                Update Password
              </h1>

              <p className="mb-6 text-center text-gray-600">
                Enter a new password for your LocalStreetShop account.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
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

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-500 hover:text-blue-700"
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}