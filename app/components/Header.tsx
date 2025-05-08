'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
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
    <header className="w-full bg-white shadow-md border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-extrabold text-blue-700 hover:text-blue-900 transition flex items-center space-x-2"
      >
        <span role="img" aria-label="Shop Icon">🛍️</span>
        <span>ShopStreet</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-6 text-gray-700 font-medium">
        {/* 🏠 Home */}
        <Link
          href="/"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Home">🏠</span>
          <span>Home</span>
        </Link>

        {/* 👤 Member */}
        <Link
          href="/member"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Member">👤</span>
          <span>Member</span>
        </Link>

        {/* 🏪 Shop Owner */}
        <Link
          href="/shop-owner"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Shop Owner">🏪</span>
          <span>Shop Owner</span>
        </Link>

        {/* Login / Profile */}
        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-sm shadow"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="text-gray-700 hover:text-blue-700 transition hidden sm:inline"
            >
              👤 {user.user_metadata?.username || user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm shadow"
            >
              Logout
            </button>
          </div>
        )}

        {/* ℹ️ About */}
        <Link
          href="/about"
          className="hover:text-blue-700 transition"
        >
          About
        </Link>
      </nav>
    </header>
  );
}
