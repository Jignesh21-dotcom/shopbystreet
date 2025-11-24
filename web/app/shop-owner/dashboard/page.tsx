'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/app/components/SEO';

export default function ShopOwnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
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
          .maybeSingle();

        if (error) {
          console.error('Error fetching shop:', error.message);
        }

        // Normalize street and city to objects (not arrays)
        let normalizedShop = shopData;
        if (normalizedShop) {
          let street = normalizedShop.street;
          if (Array.isArray(street)) street = street[0] || null;
          if (street && Array.isArray(street.city)) street.city = street.city[0] || null;
          normalizedShop = { ...normalizedShop, street };
        }

        setShop(normalizedShop);
      } else {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user && !user.user_metadata?.isShopOwner) {
      router.push('/shop-owner');
    }
  }, [user, router]);

  return (
    <>
      <SEO
        title="Shop Owner Dashboard | Shop Street"
        description="Manage your local business listing and products. During Phase 1, it’s free to add products to your shop on LocalStreetShop."
        url="https://www.localstreetshop.com/shop-owner/dashboard"
      />

      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">🛍️ Shop Owner Dashboard</h1>
          <p className="text-gray-700 mb-6">
            Welcome, <strong>{user?.email}</strong>! This is your shop management area.
          </p>

          {!shop ? (
            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800 mb-6">
              🚨 You have not added or claimed a shop yet. Please check if your shop is already listed.
              <div className="mt-4">
                <Link
                  href="/shop-owner/claim"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
                >
                  🔍 Check Existing Shops
                </Link>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                If you find your shop, you can submit a request to claim ownership. Otherwise, you can add a new shop.
              </p>

              <div className="mt-4">
                <Link
                  href="/shop-owner/shops/add"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
                >
                  ➕ Add New Shop
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Shop info */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 text-green-800">
                ✅ <strong>Your Shop:</strong> {shop.name}
                {shop.street?.name && (
                  <>
                    {' '}
                    (on {shop.street.name}
                    {shop.street.city?.name ? `, ${shop.street.city.name}` : ''}
                    )
                  </>
                )}
              </div>

              {/* Phase 1 info – free product listings */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-blue-900">
                <div className="font-semibold text-base mb-1">
                  Phase 1 – Free Product Listings
                </div>
                <p className="mb-2 text-sm">
    LocalStreetShop is currently in <strong>Phase 1</strong>. During this stage,
    there is <strong>no fee</strong> to add products to your shop. You can add and
    manage your products directly from your dashboard.
  </p>

  <p className="mb-2 text-sm">
    <strong>Phase 1 is available for a limited time.</strong> After Phase 1 ends,
    adding products will require a <strong>$99 one-time activation fee</strong>.
    Shops that join during Phase 1 will keep product management
    <strong> free forever</strong>.
  </p>

  <p className="mb-3 text-sm">
    Our team will review new products in the background to make sure everything looks
    legitimate and matches your shop. If anything needs clarification, we’ll contact
    you by email.
  </p>

  {/* Support / Donation Message */}
  <p className="text-xs text-gray-700 mb-2">
    If LocalStreetShop helps your business and you'd like to support the project, you can
    make an optional donation below. Your support helps us expand to new cities and keep
    Phase 1 free for local shop owners.
  </p>


                <div className="flex flex-wrap gap-3 mt-2">
                  <Link
                    href="/shop-owner/products/add"
                    className="inline-flex items-center rounded-full bg-green-500 px-5 py-2 text-xs font-semibold text-white hover:bg-green-600"
                  >
                    ➕ Add Product
                  </Link>
                  <Link
                    href="/shop-owner/products"
                    className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    📦 Manage Products
                  </Link>

                   {/* Donation Button */}
    <a
      href="https://buy.stripe.com/cNi3cu9mk2tk7I899N4ow00"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
    >
      💚 Support LocalStreetShop
    </a>
  </div>
</div>

              {/* Extra links (orders etc. – can be used later) */}
              <div className="flex flex-col space-y-3">
                <Link
                  href="/shop-owner/orders"
                  className="text-blue-600 hover:underline text-lg flex items-center space-x-2"
                >
                  <span>🧾</span>
                  <span>View Orders (coming soon)</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
