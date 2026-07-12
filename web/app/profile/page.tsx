'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [ownedShopCount, setOwnedShopCount] = useState(0);
  const [activeOrderRequestCount, setActiveOrderRequestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const title = 'Your Profile | LocalStreetShop';
  const description =
    'Manage your LocalStreetShop account, access shopper features, or continue to your shop owner dashboard.';
  const url = 'https://www.localstreetshop.com/profile';

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);

        const [
          { count: shopCount },
          { count: orderRequestCount },
        ] = await Promise.all([
          supabase
            .from('shops')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', data.user.id),

          supabase
            .from('order_requests')
            .select('id', { count: 'exact', head: true })
            .eq('customer_user_id', data.user.id)
            .in('status', ['pending', 'accepted']),
        ]);

        setOwnedShopCount(shopCount || 0);
        setActiveOrderRequestCount(orderRequestCount || 0);
      }

      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isShopOwner =
    Boolean(user?.user_metadata?.isShopOwner) || ownedShopCount > 0;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to Home
          </Link>

          <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-9 text-white shadow-sm sm:px-10 sm:py-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              LocalStreetShop Profile
            </p>

            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Welcome to your account
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:mt-5 sm:text-lg sm:leading-8">
              Manage your LocalStreetShop profile, access shopper features, or
              continue to your shop owner dashboard.
            </p>
          </section>

          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-8">
            {isLoading ? (
              <p className="text-slate-600">Loading your profile...</p>
            ) : user ? (
              <>
                <div className="mb-8">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                    Signed In
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                    {user.user_metadata?.username || 'Your Profile'}
                  </h2>

                  <p className="mt-2 text-slate-600">{user.email}</p>
                </div>

                <div className="mb-6 rounded-3xl border border-green-100 bg-green-50 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                        Shopper
                      </p>

                      <h3 className="mt-2 text-2xl font-extrabold text-green-950">
                        🛍️ My Order Requests ({activeOrderRequestCount})
                      </h3>

                      <p className="mt-3 max-w-2xl text-slate-700">
                        View your active and previous Order Requests and track
                        each request securely.
                      </p>
                    </div>

                    <Link
                      href="/my-order-requests"
                      className="w-full shrink-0 rounded-full bg-green-600 px-6 py-3 text-center font-bold text-white transition hover:bg-green-700 sm:w-auto"
                    >
                      View My Requests →
                    </Link>
                  </div>
                </div>

                {isShopOwner ? (
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
                    <h3 className="text-2xl font-extrabold text-blue-800">
                      🏪 Shop Owner Dashboard
                    </h3>

                    <p className="mt-3 text-slate-700">
                      You have {ownedShopCount}{' '}
                      {ownedShopCount === 1 ? 'business' : 'businesses'} linked
                      to your account. Continue to your shop owner area to manage
                      listings, products, claims, and photos.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link
                        href="/shop-owner"
                        className="w-full rounded-full bg-blue-700 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-800 sm:w-auto"
                      >
                        Go to Shop Owner Area →
                      </Link>

                      <Link
                        href="/shop-owner/products"
                        className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 text-center font-bold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
                      >
                        Manage Products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <h3 className="text-2xl font-extrabold text-slate-950">
                      👤 Shopper Account
                    </h3>

                    <p className="mt-3 text-slate-700">
                      Browse local businesses, discover deals, and manage your
                      LocalStreetShop shopping activity.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link
                        href="/live-cities"
                        className="w-full rounded-full bg-blue-700 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-800 sm:w-auto"
                      >
                        Browse Live Cities
                      </Link>

                      <Link
                        href="/deals"
                        className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 text-center font-bold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
                      >
                        View Deals
                      </Link>

                      <Link
                        href="/shop-owner"
                        className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                      >
                        Are you a shop owner?
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-600 sm:w-auto"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  You are not logged in
                </h2>

                <p className="mt-2 text-slate-600">
                  Log in or create an account to access your LocalStreetShop
                  profile.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="w-full rounded-full bg-blue-700 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-800 sm:w-auto"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 text-center font-bold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}