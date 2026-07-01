'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/app/components/SEO';

export default function ShopOwnerLanding() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.isShopOwner) {
      router.push('/shop-owner/dashboard');
    }
  }, [user, router]);

  const title = 'Shop Owner Portal | LocalStreetShop';
  const description =
    'Claim your local business, manage products, add photos, and reach customers across Canada with LocalStreetShop.';
  const url = 'https://www.localstreetshop.com/shop-owner';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-5xl mx-auto">
          <section className="text-center mb-10">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop for Businesses
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              🏪 Grow Your Local Business Online
            </h1>

            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Claim your business, manage your storefront, add products, and
              help customers discover you on your digital street.
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-8">
            <div className="grid gap-5 md:grid-cols-3 mb-8">
              <div className="bg-blue-50 rounded-2xl p-5">
                <h2 className="font-bold text-blue-800 mb-2">
                  ✅ Claim Your Listing
                </h2>
                <p className="text-sm text-gray-700">
                  Take ownership of your LocalStreetShop business profile.
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <h2 className="font-bold text-green-800 mb-2">
                  📦 Add Products
                </h2>
                <p className="text-sm text-gray-700">
                  Show products, prices, photos, deals, and business details.
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-5">
                <h2 className="font-bold text-purple-800 mb-2">
                  🚶 Be Discovered
                </h2>
                <p className="text-sm text-gray-700">
                  Appear on your city, street, address, and local shop pages.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/shop-owner-signup"
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-semibold shadow"
              >
                Sign Up as Shop Owner
              </Link>

              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold shadow"
              >
                Login
              </Link>

              <Link
                href="/shop-owner/claim"
                className="px-6 py-3 bg-white text-blue-700 border border-blue-200 rounded-full hover:bg-blue-50 transition font-semibold shadow-sm"
              >
                Claim Existing Shop
              </Link>
            </div>

            <div className="mt-8 max-w-3xl mx-auto rounded-2xl bg-yellow-50 border border-yellow-200 p-5 text-center shadow-sm">
  <h3 className="text-lg font-bold text-yellow-800">
    🎉 Founding Business Offer
  </h3>

  <p className="text-sm md:text-base text-gray-700 mt-2">
    Claim your business listing for <strong>FREE</strong> and receive exclusive
    launch benefits available only to our founding businesses.
  </p>

  <p className="text-sm font-semibold text-yellow-800 mt-2">
    Join Canada&apos;s Digital Main Street from the very beginning.
  </p>
</div>
          </section>

          <section className="bg-blue-700 text-white rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  LocalStreetShop Ambassadors may visit your business
                </h2>

                <p className="text-blue-100">
                  Our Street Ambassadors help introduce LocalStreetShop to local
                  businesses and may guide owners on how to claim their free
                  listing. LocalStreetShop handles final follow-up for paid
                  services.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5">
                <p className="font-bold mb-3">Ambassadors can help you:</p>
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
    </>
  );
}