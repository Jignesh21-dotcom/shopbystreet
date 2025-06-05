'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type Shop = {
  id: string;
  name: string;
  description?: string;
  approved: boolean;
  street: { name: string; slug: string; city?: { name: string } | null } | null;
};

export default function AdminShopModeration() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shops')
      .select(`
        id,
        name,
        description,
        approved,
        street:street_id (
          name,
          slug,
          city:city_id (
            name
          )
        )
      `)
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch pending shops:', error.message);
      setShops([]);
    } else {
      // Normalize street and city to objects (not arrays)
      const normalized = (data || []).map((shop: any) => {
        let street = shop.street;
        if (Array.isArray(street)) street = street[0] || null;
        if (street && Array.isArray(street.city)) street.city = street.city[0] || null;
        return { ...shop, street };
      });
      setShops(normalized);
    }

    setLoading(false);
  };

  // ...rest of your component remains unchanged...

  const approveShop = async (id: string) => {
    const { error } = await supabase
      .from('shops')
      .update({ approved: true })
      .eq('id', id);

    if (!error) {
      setShops((prev) => prev.filter((shop) => shop.id !== id));
    } else {
      alert('Failed to approve shop.');
    }
  };

  const deleteShop = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this shop?');
    if (!confirm) return;

    const { error } = await supabase.from('shops').delete().eq('id', id);

    if (!error) {
      setShops((prev) => prev.filter((shop) => shop.id !== id));
    } else {
      alert('Failed to delete shop.');
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <>
      <SEO
        title="Admin: Pending Shop Moderation | Shop Street"
        description="Review and moderate shops submitted by users before they go live."
        url="https://www.localstreetshop.com/admin/shop"
        noindex
      />
      <main className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">🛠️ Admin: Pending Shops</h1>

        {loading ? (
          <p>Loading pending shops...</p>
        ) : shops.length === 0 ? (
          <p className="text-green-600 font-semibold">✅ No pending shops to review!</p>
        ) : (
          <ul className="space-y-6">
            {shops.map((shop) => (
              <li
                key={shop.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800">{shop.name}</h2>
                <p className="text-gray-600 mb-2">
                  {shop.description || 'No description provided'}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {shop.street?.name
                    ? `Street: ${shop.street.name}${shop.street.city?.name ? `, City: ${shop.street.city.name}` : ''}`
                    : 'No street info'}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => approveShop(shop.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => deleteShop(shop.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    ❌ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}