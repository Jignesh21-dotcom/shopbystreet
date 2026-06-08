'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/app/components/SEO';

type ClaimResult = {
  id: string;
  name: string;
  slug: string;
  cityName?: string;
  citySlug?: string;
  streetName?: string;
  streetSlug?: string;
  address?: string;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function ClaimShopPage() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [shops, setShops] = useState<ClaimResult[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleSearch = async () => {
    const shopQuery = search.trim();
    const cityQuery = citySearch.trim().toLowerCase();

    if (!shopQuery && !cityQuery) return;

    setSearched(true);
    setShops([]);

    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        slug,
        address,
        street:street_id (
          name,
          slug,
          city:city_id (
            name,
            slug
          )
        )
      `)
      .order('name', { ascending: true })
      .limit(300);

    if (shopQuery) {
      query = query.ilike('name', `%${shopQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Shop search error:', error.message);
      alert(`Search failed: ${error.message}`);
      return;
    }

    const normalized: ClaimResult[] = (data || [])
      .map((shop: any) => {
        let street = shop.street;

        if (Array.isArray(street)) {
          street = street[0] || null;
        }

        if (street && Array.isArray(street.city)) {
          street.city = street.city[0] || null;
        }

        return {
          id: shop.id,
          name: shop.name,
          slug: shop.slug || slugify(shop.name),
          address: shop.address,
          streetName: street?.name,
          streetSlug: street?.slug,
          cityName: street?.city?.name,
          citySlug: street?.city?.slug,
        };
      })
      .filter((shop) => {
        if (!cityQuery) return true;

        return (
          shop.cityName?.toLowerCase().includes(cityQuery) ||
          shop.citySlug?.toLowerCase().includes(cityQuery)
        );
      });

    const unique = Array.from(
      new Map(normalized.map((shop) => [shop.id, shop])).values()
    );

    setShops(unique);
  };

  const handleClaim = async (shop: ClaimResult) => {
    if (!user) return;

    setSubmittingId(shop.id);

    const { error } = await supabase.from('shop_claims').insert([
      {
        shop_id: shop.id,
        user_id: user.id,
        message: messages[shop.id] || '',
      },
    ]);

    if (error) {
      alert(`❌ ${error.message}`);
      console.error(error);
    } else {
      alert('✅ Claim request submitted! We’ll review it shortly.');
      setMessages((prev) => ({ ...prev, [shop.id]: '' }));
    }

    setSubmittingId(null);
  };

  return (
    <>
      <SEO
        title="Claim Your Shop | Shop Street"
        description="Are you the owner of a shop listed on Shop Street? Submit a claim request to manage your listing and showcase your business."
        url="https://www.localstreetshop.com/shop-owner/claim"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            🔍 Claim Your Shop
          </h1>

          <p className="mb-6 text-gray-700">
            Search your business by name and city. If your shop is listed, you
            can request access to manage it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <input
              type="text"
              placeholder="Shop name, e.g. Coffee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-xl"
            />

            <input
              type="text"
              placeholder="City, e.g. Kitchener"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-xl"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Search
            </button>
          </div>

          {searched && (
            <p className="text-gray-600 mb-5">
              Found {shops.length} matching businesses.
            </p>
          )}

          {shops.length > 0 ? (
            <div className="space-y-4">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-gray-50"
                >
                  {shop.citySlug && shop.streetSlug ? (
                    <a
                      href={`/cities/${shop.citySlug}/${shop.streetSlug}/${shop.slug}`}
                      target="_blank"
                      className="font-bold text-xl text-gray-900 hover:text-blue-700 hover:underline"
                    >
                      {shop.name}
                    </a>
                  ) : (
                    <div className="font-bold text-xl text-gray-900">
                      {shop.name}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mt-1">
                    {shop.streetName && <>Street: {shop.streetName}</>}
                    {shop.cityName && <> | City: {shop.cityName}</>}
                    {shop.address && <> | Address: {shop.address}</>}
                  </div>

                  {shop.citySlug && shop.streetSlug && (
                    <a
                      href={`/cities/${shop.citySlug}/${shop.streetSlug}/${shop.slug}`}
                      target="_blank"
                      className="inline-block mt-3 text-blue-700 font-semibold hover:underline"
                    >
                      View listing →
                    </a>
                  )}

                  <textarea
                    className="mt-4 w-full p-3 border rounded-xl"
                    placeholder="Add a message for the admin (optional)"
                    value={messages[shop.id] || ''}
                    onChange={(e) =>
                      setMessages((prev) => ({
                        ...prev,
                        [shop.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    onClick={() => handleClaim(shop)}
                    disabled={submittingId === shop.id}
                    className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {submittingId === shop.id
                      ? 'Submitting...'
                      : '📩 Request Access'}
                  </button>
                </div>
              ))}
            </div>
          ) : searched ? (
            <div className="text-gray-600 bg-gray-50 rounded-xl p-5">
              No matching businesses found. Try a shorter shop name or search by
              city only.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}