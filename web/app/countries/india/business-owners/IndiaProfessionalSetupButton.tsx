'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function IndiaProfessionalSetupButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/india/professional-setup/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          email: session?.user?.email || '',
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Unable to start secure checkout.');
      }

      window.location.href = result.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to start secure checkout.',
      );
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Opening Secure Checkout…' : 'Pay ₹1,299 for Professional Setup'}
      </button>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs font-medium text-slate-500">
        Secure payment powered by Stripe. Amount charged in INR.
      </p>
    </div>
  );
}
