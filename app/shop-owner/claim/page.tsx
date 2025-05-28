'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/components/SEO';

export default function ClaimShopPage() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // ✅ Get logged in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      else router.push('/login');
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch shops matching search
  const handleSearch = async () => {
    if (search.trim() === '') return;

    const { data, error } = await supabase
      .from('shops')
      .select('id, name, slug, streetSlug')
      .ilike('name', `%${search}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error.message);
    } else {
      setShops(data);
    }
  };

  // ✅ Submit a shop claim
  const handleClaim = async (shopId: string) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('shop_claims').insert([
      {
        shop_id: shopId,
        user_id: user.id,
        message,
      },
    ]);

    if (error) {
      alert('❌ Failed to submit claim. You may have already submitted one.');
      console.error(error.message);
    } else {
      alert('✅ Claim request submitted! We’ll review it shortly.');
      setMessage('');
    }

    setSubmitting(false);
  };

  return (
    <>
      <SEO
        title="Claim Your Shop | Shop Street"
        description="Are you the owner of a shop listed on Shop Street? Submit a claim request to manage your listing and showcase your business."
        url="https://www.localstreetshop.com/shop-owner/claim"
      />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">🔍 Claim Your Shop</h1>
          <p className="mb-4 text-gray-700">
            Search your shop below. If it's listed, you can request access to manage it.
          </p>

          <div className="flex space-x-2 mb-6">
            <input
              type="text"
              placeholder="Enter shop name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>

          {shops.length > 0 && (
            <div className="space-y-4">
              {shops.map((shop) => (
                <div key={shop.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                  <div className="font-semibold text-lg text-gray-800">{shop.name}</div>
                  <div className="text-sm text-gray-600">Street: {shop.streetSlug}</div>

                  <textarea
                    className="mt-2 w-full p-2 border rounded"
                    placeholder="Add a message for the admin (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button
                    onClick={() => handleClaim(shop.id)}
                    disabled={submitting}
                    className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : '📩 Request Access'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
