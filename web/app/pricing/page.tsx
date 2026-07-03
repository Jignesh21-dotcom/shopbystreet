'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type PaidTier = 'growth' | 'premium';

export default function PricingPage() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserShop = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userData.user.id)
        .eq('approved', true)
        .limit(1)
        .single();

      if (data?.id) {
        setShopId(data.id);
      }
    };

    fetchUserShop();
  }, []);

  const triggerCheckout = async (tier: PaidTier) => {
    setErrorMessage(null);
    setLoadingTier(tier);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user?.email) {
        window.location.href = '/login';
        return;
      }

      if (!shopId) {
        alert('Please register or claim an approved shop profile before subscribing.');
        window.location.href = '/shop-owner';
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.user.email,
          tier,
          shopId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Unable to start checkout.');
      }

      window.location.href = result.url;
    } catch (error: any) {
      setErrorMessage(error?.message || 'Unable to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      <section className="bg-gradient-to-b from-blue-50 to-gray-50 py-16 px-4 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Founding Business Program
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-4 tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Put your local brick-and-mortar storefront on Canada&apos;s digital main street. Choose
            a tier to showcase your inventory to neighborhood shoppers.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col justify-between hover:border-gray-300 transition-all duration-200">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Basic Directory</h3>
                  <p className="text-xs text-gray-500 mt-1">Get your store discovered online</p>
                </div>
              </div>
              <div className="mt-6 border-b border-gray-100 pb-6">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-sm font-medium text-gray-500"> / lifetime free</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Complete Business Contact Profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Map Location &amp; Directory Category Routing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Direct Website &amp; Social Media Anchor Links</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400 line-through">
                  <span className="font-bold">✗</span>
                  <span>Digital Window Product Image Uploads</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                href="/shop-owner"
                className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition duration-150"
              >
                Claim Free Profile
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-md p-8 flex flex-col justify-between relative transform md:-translate-y-2 transition-all duration-200">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
              Most Popular
            </div>
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Growth Showcase</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    First 10 products are 100% FREE
                  </p>
                </div>
              </div>
              <div className="mt-6 border-b border-gray-100 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">$15</span>
                  <span className="text-sm font-medium text-gray-500"> / month</span>
                </div>
                
              </div>
              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3 font-semibold text-blue-900">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Includes Everything in Basic</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Upload up to 20 Products</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>High-Res Inventory Photo &amp; Pricing Modules</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Product Descriptions &amp; Variant Tags</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => triggerCheckout('growth')}
                disabled={loadingTier !== null}
                className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingTier === 'growth' ? 'Redirecting to Checkout...' : 'Choose Growth Showcase'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col justify-between hover:border-gray-300 transition-all duration-200">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Premium Main Street</h3>
                  <p className="text-xs text-gray-500 mt-1">Complete digital display window</p>
                </div>
              </div>
              <div className="mt-6 border-b border-gray-100 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">$39</span>
                  <span className="text-sm font-medium text-gray-500"> / month</span>
                </div>
                
              </div>
              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3 font-semibold text-gray-900">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Includes Everything in Growth</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Unlimited Product Image Uploads</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Priority Featured Placement on Street Pages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Verified Business Badge Status</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => triggerCheckout('premium')}
                disabled={loadingTier !== null}
                className="block text-center w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl transition duration-150 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingTier === 'premium' ? 'Redirecting to Checkout...' : 'Choose Premium Main Street'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-xl font-bold">Met with one of our Street Ambassadors?</h4>
            <p className="text-sm text-blue-100 mt-2">
              Enter their unique referral code during listing setup or within your shop dashboard
              to permanently unlock the locked-in student discount pricing tiers.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/shop-owner"
              className="inline-block bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-full transition duration-150 text-sm"
            >
              Apply Code in Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
