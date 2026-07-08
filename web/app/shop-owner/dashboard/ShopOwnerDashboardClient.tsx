'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

type City = {
  name: string;
  slug: string;
};

type Street = {
  name: string;
  slug: string;
  city: City | City[] | null;
};

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  street: Street | Street[] | null;
};

type TierNoticeProps = {
  usageText: string;
  borderClassName: string;
};

function FoundingProgramBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-5 rounded-xl mb-6">
      <h2 className="text-lg font-bold text-blue-800 mb-2">🚀 Founding Business Program</h2>

      <p className="text-sm text-gray-700 mb-2">
        LocalStreetShop is building a new way for customers to shop local online.
      </p>

      <p className="text-sm text-gray-700 mb-2">
        During Phase 1, businesses can claim their shop, update their business information, and showcase up to 100 products with images completely free.
      </p>

      <p className="text-sm text-gray-700 mb-2">
        Our vision is to allow customers to browse local streets, discover products from nearby
        businesses, and purchase online directly from local shops without business owners needing
        to build their own website.
      </p>

      <p className="text-sm font-semibold text-green-700">
        🎉 Businesses that join during Phase 1 will receive special Founding Business benefits as
        the platform grows.
      </p>
    </div>
  );
}

function normalizeShops(shopData: Shop[] | null): Shop[] {
  return (shopData || []).map((shop) => {
    const streetRaw = Array.isArray(shop.street) ? shop.street[0] || null : shop.street;
    const cityRaw = streetRaw?.city;
    const city = Array.isArray(cityRaw) ? cityRaw[0] || null : cityRaw || null;

    return {
      ...shop,
      street: streetRaw ? { ...streetRaw, city } : null,
    };
  });
}

function TierNotice({ usageText, borderClassName }: TierNoticeProps) {
  return (
    <div
      className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${borderClassName}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-600">Account Tier:</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold tracking-wide uppercase text-[10px]">
          Free Project Showcase
        </span>
      </div>

      <div className="text-gray-600">
        <span className="font-semibold text-gray-700">Product Usage:</span> {usageText}
      </div>

      <Link
        href="/business-owners"
        className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-sm transition"
      >
        Learn About Business Owner Program
      </Link>
    </div>
  );
}

export default function ShopOwnerDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        if (!isMounted) return;
        setErrorMessage(`Authentication error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        router.push('/login');
        return;
      }

      if (!isMounted) return;
      setUser(authData.user);

      const { data: shopData, error } = await supabase
        .from('shops')
        .select(`
          *,
          street:street_id (
            name,
            slug,
            city:city_id (
              name,
              slug
            )
          )
        `)
        .eq('owner_id', authData.user.id)
        .eq('approved', true)
        .order('name', { ascending: true });

      if (!isMounted) return;

      if (error) {
        setErrorMessage(`Error fetching shops: ${error.message}`);
        setShops([]);
        setLoading(false);
        return;
      }

      setShops(normalizeShops(shopData as Shop[]));
      setLoading(false);
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-md sm:p-6">
        <h1 className="mb-4 text-2xl font-bold text-blue-700 sm:text-3xl">🛍️ Shop Owner Dashboard</h1>

        <p className="text-gray-700 mb-6">
          Welcome, <strong>{user?.email}</strong>! This is your shop management area.
        </p>

        {loading ? (
          <div className="bg-white border rounded-lg p-4 text-gray-600">Loading your shops...</div>
        ) : errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {errorMessage}
          </div>
        ) : shops.length === 0 ? (
          <>
            <FoundingProgramBanner />

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800">
              <p className="font-semibold">🚨 You have not added or claimed a shop yet.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/shop-owner/claim"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  🔍 Claim Existing Shop
                </Link>

                <Link
                  href="/shop-owner/shops/add"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  ➕ Add New Shop
                </Link>
              </div>

              <TierNotice
                usageText="Claim a shop to unlock 100 free uploads."
                borderClassName="border-yellow-300"
              />

              <p className="mt-3 text-sm text-gray-600">
                If your shop is already listed, claim it. If not, add it as a new shop.
              </p>
            </div>
          </>
        ) : (
          <>
            <FoundingProgramBanner />

            <div className="space-y-4">
              {shops.map((shop) => {
                const street = Array.isArray(shop.street) ? shop.street[0] || null : shop.street;
                const cityRaw = street?.city;
                const city = Array.isArray(cityRaw) ? cityRaw[0] || null : cityRaw;

                const publicHref =
                  city?.slug && street?.slug && shop?.slug
                    ? `/cities/${city.slug}/${street.slug}/${shop.slug}`
                    : null;

                return (
                  <div
                    key={shop.id}
                    className="border border-gray-200 rounded-xl p-5 bg-green-50"
                  >
                    <h2 className="text-xl font-bold text-green-800 sm:text-2xl">✅ {shop.name}</h2>

                    <p className="text-gray-700 mt-1">
                      {street?.name && <>Street: {street.name}</>}
                      {city?.name && <> | City: {city.name}</>}
                      {shop.address && <> | Address: {shop.address}</>}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/shop-owner/shops/${shop.id}`}
                        className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600 max-sm:w-full max-sm:text-center"
                      >
                        ✏️ Manage Shop
                      </Link>

                      <Link
                        href="/shop-owner/products/add"
                        className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 max-sm:w-full max-sm:text-center"
                      >
                        ➕ Add Product
                      </Link>

                      <Link
  href="/business-owners"
  className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 max-sm:w-full max-sm:text-center"
>
  🏪 Business Owner Program
</Link>

                      <Link
                        href="/shop-owner/products"
                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 max-sm:w-full max-sm:text-center"
                      >
                        📦 Manage Products
                      </Link>

                      {publicHref && (
                        <Link
                          href={publicHref}
                          target="_blank"
                          className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 max-sm:w-full max-sm:text-center"
                        >
                          👁️ View Public Listing
                        </Link>
                      )}

                     <Link
  href="/support"
  className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 max-sm:w-full max-sm:text-center"
>
  💚 Support the Project
</Link>
                    </div>

                    <TierNotice
                      usageText="You currently have access to 100 free product uploads."
                      borderClassName="border-green-200"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}