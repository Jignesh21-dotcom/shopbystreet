'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ShopOwnerLandingClient() {
  const router = useRouter();

  useEffect(() => {
    const checkShopOwner = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user?.user_metadata?.isShopOwner) {
        router.push('/shop-owner/dashboard');
      }
    };

    checkShopOwner();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-6 text-gray-900 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-700">
            LocalStreetShop for Businesses
          </p>

          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-950 sm:mb-4 sm:text-4xl md:text-5xl">
            Grow Your Local Business Online
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-relaxed">
            Claim your business, manage your storefront, add products, and help
            customers discover you on your digital street.
          </p>
        </section>

        <section className="mb-6 rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:mb-8 sm:p-6 md:p-10">
          <div className="mb-6 grid gap-4 sm:mb-8 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <h2 className="mb-2 text-lg font-bold text-blue-900">
                Claim Your Listing
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                Take ownership of your LocalStreetShop business profile and keep
                your information up to date.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <h2 className="mb-2 text-lg font-bold text-blue-900">
                Add Products
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                Show products, prices, photos, deals, and business details to
                nearby shoppers.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <h2 className="mb-2 text-lg font-bold text-blue-900">
                Be Discovered Locally
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                Appear on your city, street, address, and shop pages as
                customers explore local businesses.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/shop-owner-signup"
              prefetch={false}
              className="w-full rounded-full bg-blue-700 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-800 sm:w-auto"
            >
              Sign Up as Shop Owner
            </Link>

            <Link
              href="/login"
              className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 text-center font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
            >
              Login
            </Link>

            <Link
              href="/shop-owner/claim"
              className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 text-center font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
            >
              Claim Existing Shop
            </Link>
          </div>

          <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-center shadow-sm sm:mt-8 sm:p-5">
            <h3 className="text-lg font-bold text-yellow-900">
              Founding Business Offer
            </h3>

            <p className="mt-2 text-sm text-gray-700 md:text-base">
              Claim your business listing for <strong>free</strong> and receive
              launch benefits available only to founding businesses.
            </p>

            <p className="mt-2 text-sm font-semibold text-yellow-900">
              Join Canada&apos;s Digital Main Street from the beginning.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-blue-700 p-5 text-white shadow-sm sm:p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-3 text-xl font-bold sm:text-2xl">
                LocalStreetShop Ambassadors may visit your business
              </h2>

              <p className="leading-relaxed text-blue-100">
                Our Street Ambassadors help introduce LocalStreetShop to local
                businesses and may guide owners through the free claim process.
                LocalStreetShop handles final follow-up for any paid services.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="mb-3 font-bold">Ambassadors can help you:</p>

              <ul className="space-y-2 text-sm text-blue-50">
                <li>✓ Understand how LocalStreetShop works</li>
                <li>✓ Find your business listing</li>
                <li>✓ Start the claim process</li>
                <li>✓ Connect with the LocalStreetShop team</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}