'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      const normalized = (data || []).map((shop: any) => {
        let street = shop.street;
        if (Array.isArray(street)) street = street[0] || null;
        if (street && Array.isArray(street.city)) {
          street.city = street.city[0] || null;
        }
        return { ...shop, street };
      });

      setShops(normalized);
    }

    setLoading(false);
  };

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
    const confirmed = window.confirm('Are you sure you want to delete this shop?');
    if (!confirmed) return;

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
        title="Admin: Pending Shop Moderation | LocalStreetShop"
        description="Review and moderate shops submitted by users before they go live."
        url="https://www.localstreetshop.com/admin/shops"
        noindex
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/admin"
            className="inline-block mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back to Admin
          </Link>

          <section className="text-center mb-8">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop Admin
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Pending Shop Moderation
            </h1>

            <p className="text-gray-600">
              Review newly submitted shops before they appear publicly.
            </p>
          </section>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center text-gray-600">
              Loading pending shops...
            </div>
          ) : shops.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-xl font-bold text-green-700 mb-2">
                No pending shops
              </h2>
              <p className="text-gray-600">
                There are no shop submissions waiting for review right now.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {shops.map((shop) => (
                <section
                  key={shop.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-700">
                        {shop.name}
                      </h2>

                      <p className="text-gray-600 mt-2">
                        {shop.description || 'No description provided.'}
                      </p>

                      <p className="text-sm text-gray-500 mt-3">
                        {shop.street?.name
                          ? `Street: ${shop.street.name}${
                              shop.street.city?.name
                                ? `, City: ${shop.street.city.name}`
                                : ''
                            }`
                          : 'No street information available.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[160px]">
                      <button
                        onClick={() => approveShop(shop.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full font-semibold transition"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => deleteShop(shop.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}