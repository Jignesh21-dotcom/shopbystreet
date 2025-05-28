'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/app/components/SEO';

export default function ShopOwnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        const { data: shopData, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', data.user.id)
          .eq('approved', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching shop:', error.message);
        }

        setShop(shopData);
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

  const shopStatus = user?.user_metadata?.shopStatus || 'pendingPayment';

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ email: user.email }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start payment.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Shop Owner Dashboard | Shop Street"
        description="Manage your local business listing, add products, view orders, and keep your shop presence up-to-date."
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
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 text-green-800">
                ✅ <strong>Your Shop:</strong> {shop.name} (on {shop.streetSlug})
              </div>

              {shopStatus === 'pendingPayment' ? (
                <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800 mb-6">
                  ⚠️ Your shop is not active yet. Please complete your $49 payment to unlock product management.
                  <div className="mt-4">
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Redirecting to payment...' : '💳 Complete Payment'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <Link
                      href="/shop-owner/products/add"
                      className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
                    >
                      ➕ Add Product
                    </Link>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/shop-owner/products"
                      className="text-blue-600 hover:underline text-lg flex items-center space-x-2"
                    >
                      <span>📦</span>
                      <span>Manage Products</span>
                    </Link>
                    <Link
                      href="/shop-owner/orders"
                      className="text-blue-600 hover:underline text-lg flex items-center space-x-2"
                    >
                      <span>🧾</span>
                      <span>View Orders</span>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
