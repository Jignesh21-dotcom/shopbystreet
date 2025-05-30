'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import SEO from '@/app/components/SEO';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const title = 'Your Profile | Local Street Shop';
  const description = 'View your account info, username, and logout securely from your Local Street Shop profile page.';
  const url = 'https://www.localstreetshop.com/profile';

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-6">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-green-700 mb-6">👤 Your Profile</h1>

          {isLoading ? (
            <p className="text-gray-600">Loading user info...</p>
          ) : user ? (
            <>
              <p className="text-lg text-gray-700 mb-2">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-lg text-gray-700 mb-4">
                <strong>Username:</strong>{' '}
                {user.user_metadata?.username || 'No username set'}
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <p className="text-gray-600">No user information available.</p>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
