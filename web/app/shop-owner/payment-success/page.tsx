'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const activateShop = async () => {
      await supabase.auth.updateUser({
        data: { shopStatus: 'active' },
      });

      setTimeout(() => {
        router.push('/shop-owner/dashboard');
      }, 5000);
    };

    activateShop();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-center text-white shadow-sm sm:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl">
            ✅
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Payment Complete
          </p>

          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Thank you for supporting LocalStreetShop!
          </h1>

          <p className="mt-5 text-lg leading-8 text-blue-50">
            Your payment has been received successfully. Your shop owner access
            is being updated, and you'll be redirected to your dashboard shortly.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            What's next?
          </h2>

          <div className="mt-6 space-y-4 text-left text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              📦 Add products to your shop.
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              🖼 Upload your storefront image.
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              ✏️ Keep your business information up to date.
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop-owner/dashboard"
              className="rounded-full bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Go to Dashboard
            </Link>

            <Link
              href="/shop-owner/products/add"
              className="rounded-full border border-blue-200 bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Add Products
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Redirecting automatically in 5 seconds…
          </p>
        </section>
      </div>
    </main>
  );
}