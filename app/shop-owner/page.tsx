'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ShopOwnerLanding() {
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
  }, []);

  // ✅ If logged-in user is a shop owner, auto-redirect to dashboard
  useEffect(() => {
    if (user?.user_metadata?.isShopOwner) {
      router.push('/shop-owner/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">🏪 Shop Owner Area</h1>
        <p className="text-gray-700 mb-6">
          Welcome to the ShopStreet Shop Owner section!  
          List your shop, manage your products, and reach new customers across Canada.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/shop-owner-signup"
            className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition font-semibold"
          >
            📝 Sign Up as Shop Owner
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition font-semibold"
          >
            🔑 Login
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Already a shop owner? Log in to manage your products.
        </p>
      </div>
    </div>
  );
}
