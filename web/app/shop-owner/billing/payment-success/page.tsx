'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillingPaymentSuccessPage() {
  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [secondsRemaining, setSecondsRemaining] =
    useState(4);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    setSessionId(params.get('session_id'));
  }, []);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      window.location.href =
        '/shop-owner/billing?payment=success';
      return;
    }

    const timeout = window.setTimeout(
      () =>
        setSecondsRemaining(
          (current) => current - 1,
        ),
      1000,
    );

    return () =>
      window.clearTimeout(timeout);
  }, [secondsRemaining]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-green-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <div
          className="text-5xl"
          aria-hidden="true"
        >
          ✅
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Payment submitted
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
          Thank you
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Stripe has received your payment. LocalStreetShop
          is securely confirming it and updating your
          marketplace balance.
        </p>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Your balance may take a few seconds to update
          while the verified Stripe webhook is processed.
        </div>

        {sessionId && (
          <p className="mt-5 break-all text-xs text-slate-400">
            Checkout reference: {sessionId}
          </p>
        )}

        <p className="mt-6 text-sm font-semibold text-slate-600">
          Returning to Billing Center in{' '}
          {secondsRemaining}…
        </p>

        <Link
          href="/shop-owner/billing?payment=success"
          className="mt-5 inline-flex rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          Return to Billing Center
        </Link>
      </div>
    </main>
  );
}