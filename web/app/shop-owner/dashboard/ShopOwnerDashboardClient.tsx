'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';


export default function ShopOwnerDashboardClient() {
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);

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
        .eq('owner_id', data.user.id)
        .eq('approved', true)
        .order('name', { ascending: true });

      if (error) {
        alert(`Error fetching shops: ${error.message}`);
        setShops([]);
        setLoading(false);
        return;
      }

      const normalizedShops = (shopData || []).map((shop: any) => {
        let street = shop.street;

        if (Array.isArray(street)) street = street[0] || null;

        if (street?.city && Array.isArray(street.city)) {
          street.city = street.city[0] || null;
        }

        return {
          ...shop,
          street,
        };
      });

      setShops(normalizedShops);
      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  return (
    <>
      

      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            🛍️ Shop Owner Dashboard
          </h1>

          <p className="text-gray-700 mb-6">
            Welcome, <strong>{user?.email}</strong>! This is your shop management area.
          </p>

          {loading ? (
            <div className="bg-white border rounded-lg p-4 text-gray-600">
              Loading your shops...
            </div>
          ) : shops.length === 0 ? (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-5 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-800 mb-2">
                  🚀 Founding Business Program
                </h2>

                <p className="text-sm text-gray-700 mb-2">
                  LocalStreetShop is building a new way for customers to shop local online.
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  During Phase 1, businesses can claim their shop, update their business
                  information, and add products completely free.
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  Our vision is to allow customers to browse local streets, discover products
                  from nearby businesses, and purchase online directly from local shops —
                  without business owners needing to build their own website.
                </p>

                <p className="text-sm font-semibold text-green-700">
                  🎉 Businesses that join during Phase 1 will receive special Founding
                  Business benefits as the platform grows.
                </p>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800">
                🚨 You have not added or claimed a shop yet.

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

                <p className="mt-3 text-sm text-gray-600">
                  If your shop is already listed, claim it. If not, add it as a new shop.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-5 rounded-xl mb-6">
                <h2 className="text-lg font-bold text-blue-800 mb-2">
                  🚀 Founding Business Program
                </h2>

                <p className="text-sm text-gray-700 mb-2">
                  LocalStreetShop is building a new way for customers to shop local online.
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  During Phase 1, businesses can claim their shop, update their business
                  information, and add products completely free.
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  Our vision is to allow customers to browse local streets, discover products
                  from nearby businesses, and purchase online directly from local shops —
                  without business owners needing to build their own website.
                </p>

                <p className="text-sm font-semibold text-green-700">
                  🎉 Businesses that join during Phase 1 will receive special Founding
                  Business benefits as the platform grows.
                </p>
              </div>

              <div className="space-y-4">
                {shops.map((shop) => {
                  const street = shop.street;
                  const city = street?.city;

                  const publicHref =
                    city?.slug && street?.slug && shop?.slug
                      ? `/cities/${city.slug}/${street.slug}/${shop.slug}`
                      : null;

                  return (
                    <div
                      key={shop.id}
                      className="border border-gray-200 rounded-xl p-5 bg-green-50"
                    >
                      <h2 className="text-2xl font-bold text-green-800">
                        ✅ {shop.name}
                      </h2>

                      <p className="text-gray-700 mt-1">
                        {street?.name && <>Street: {street.name}</>}
                        {city?.name && <> | City: {city.name}</>}
                        {shop.address && <> | Address: {shop.address}</>}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <Link
                          href={`/shop-owner/shops/${shop.id}`}
                          className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                        >
                          ✏️ Manage Shop
                        </Link>

                        <Link
                          href="/shop-owner/products/add"
                          className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          ➕ Add Product
                        </Link>

                        <Link
                          href="/shop-owner/products"
                          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          📦 Manage Products
                        </Link>

                        {publicHref && (
                          <Link
                            href={publicHref}
                            target="_blank"
                            className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            👁️ View Public Listing
                          </Link>
                        )}

                        <a
                          href="https://buy.stripe.com/cNi3cu9mk2tk7I899N4ow00"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          💚 Support LocalStreetShop
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}