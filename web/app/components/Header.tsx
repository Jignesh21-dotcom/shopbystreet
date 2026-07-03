'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center space-x-3 transition hover:opacity-90"
        >
          <Image src="/lss-logo.png" alt="LocalStreetShop Logo" width={58} height={58} priority />

          <div className="leading-none">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              <span className="text-blue-700">Local</span>
              <span className="text-blue-700">Street</span>
              <span className="text-blue-700">Shop</span>
            </h1>

            <p className="hidden text-[11px] tracking-wide text-gray-500 lg:block">
              The Digital Main Street of Canada
            </p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 font-medium text-gray-700 lg:flex xl:gap-6">
        <Link
          href="/"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Home">🏠</span>
          <span>Home</span>
        </Link>

        <Link
          href="/live-cities"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Live Cities">🏙️</span>
          <span>Live Cities</span>
        </Link>

        <Link
          href="/deals"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Deals">🔥</span>
          <span>Deals</span>
        </Link>

        <Link
          href="/member"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Member">👤</span>
          <span>Account</span>
        </Link>

        <div className="group relative">
          <Link
            href="/shop-owner"
            className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
          >
            <span role="img" aria-label="Shop Owner">🏪</span>
            <span>Shop Owner</span>
          </Link>

          <div className="invisible absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <Link
              href="/shop-owner"
              className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              💼 Shop Owner Portal
            </Link>
            <Link
              href="/pricing"
              className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              🏷️ Pricing & Tiers
            </Link>
          </div>
        </div>

        <Link
          href="/street-ambassador"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Street Ambassador">🤝</span>
          <span>Ambassador</span>
        </Link>

        <Link
          href="/home-businesses"
          className="flex items-center space-x-1 whitespace-nowrap transition hover:text-blue-700"
        >
          <span role="img" aria-label="Home Biz">🧵</span>
          <span>Home Biz</span>
        </Link>
        </nav>

        <div className="hidden shrink-0 items-center space-x-3 lg:flex">
        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm shadow"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="max-w-[120px] truncate text-gray-700 transition hover:text-blue-700 xl:max-w-[170px]"
            >
              👤 {user.user_metadata?.username || user.email}
            </Link>

            {user.user_metadata?.isAdmin && (
              <Link
                href="/admin/shops"
                className="text-sm text-yellow-600 hover:text-yellow-800 font-semibold underline transition"
                title="Go to Admin Panel"
              >
                👑 Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm shadow"
            >
              Logout
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}