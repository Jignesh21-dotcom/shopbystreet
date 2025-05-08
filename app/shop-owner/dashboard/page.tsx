

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ShopOwnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null); // ✅ new shop state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        // ✅ Fetch their shop once we have the user
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', data.user.id)
          .single();

        setShop(shopData);
      } else {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Redirect non-shop-owners back to info page
  useEffect(() => {
    if (user && !user.user_metadata?.isShopOwner) {
      router.push('/shop-owner');
    }
  }, [user, router]);

  const shopStatus = user?.user_metadata?.shopStatus || 'pendingPayment';

  // ✅ Stripe payment handler
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
        window.location.href = data.url; // Redirect to Stripe Checkout
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
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          🛍️ Shop Owner Dashboard
        </h1>

        <p className="text-gray-700 mb-6">
          Welcome, <strong>{user?.email}</strong>! This is your shop management area.
        </p>

        {/* ✅ If no shop exists, show Add Shop prompt */}
        {!shop ? (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800 mb-6">
            🚨 You have not added a shop yet. Please add your shop to start managing products.
            <div className="mt-4">
              <Link
                href="/shop-owner/shops/add"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
              >
                ➕ Add Shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ Show shop details */}
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
  );
}
