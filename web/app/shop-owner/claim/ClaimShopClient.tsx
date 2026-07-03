'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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

type ExistingClaim = {
  id: string;
  shop_id: string;
  status: 'pending' | 'approved' | 'rejected';
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function ClaimShopClient() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [shops, setShops] = useState<ClaimResult[]>([]);
  const [existingClaims, setExistingClaims] = useState<Record<string, ExistingClaim>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserAndClaims = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);

      const { data: claims, error } = await supabase
        .from('shop_claims')
        .select('id, shop_id, status')
        .eq('user_id', data.user.id);

      if (error) {
        console.error('Failed to fetch user claims:', error.message);
        return;
      }

      const claimMap = (claims || []).reduce(
        (acc: Record<string, ExistingClaim>, claim: ExistingClaim) => {
          acc[claim.shop_id] = claim;
          return acc;
        },
        {}
      );

      setExistingClaims(claimMap);
    };

    fetchUserAndClaims();
  }, [router]);

  const handleSearch = async () => {
    const shopQuery = search.trim();
    const cityQuery = citySearch.trim().toLowerCase();

    if (!shopQuery && !cityQuery) return;

    setSearched(true);
    setShops([]);

    let query = supabase
      .from('shops')
      .select(
        `
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
      `
      )
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
    if (existingClaims[shop.id]) return;

    setSubmittingId(shop.id);

    try {
      const response = await fetch('/api/shop-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: shop.id,
          shopName: shop.name,
          shopAddress: shop.address || null,
          shopCity: shop.cityName || null,
          shopStreet: shop.streetName || null,
          message: messages[shop.id] || '',
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`❌ ${result?.error || 'Unable to submit claim request.'}`);
        return;
      }

      const claim = result?.claim as ExistingClaim | undefined;

      if (claim) {
        setExistingClaims((prev) => ({
          ...prev,
          [shop.id]: claim,
        }));
      }

      setMessages((prev) => ({ ...prev, [shop.id]: '' }));

      if (result?.alreadyExists) {
        alert('ℹ️ A claim for this shop is already submitted.');
      } else {
        alert('✅ Claim request submitted! We’ll review it shortly.');
      }
    } catch (error) {
      console.error('Claim submit error:', error);
      alert('❌ Unable to submit claim request right now. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  const getClaimButtonText = (shopId: string) => {
    const claim = existingClaims[shopId];

    if (!claim) return 'Request Access';

    if (claim.status === 'approved') return 'Claim Approved';
    if (claim.status === 'rejected') return 'Claim Rejected';

    return 'Claim Submitted';
  };

  return (
    <>
     

      <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/shop-owner"
            className="mb-6 inline-flex items-center text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            ← Back to Shop Owner
          </Link>

          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-9 text-white shadow-sm sm:px-10 sm:py-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              Shop Owner Access
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Claim your business listing
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:mt-5 sm:text-lg sm:leading-8">
              Search for your business and submit a claim request. Once approved,
              you can manage your listing, add photos, update details, and add
              products from your Shop Owner dashboard.
            </p>
          </section>

          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                Find your shop
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Search by business name and city
              </h2>

              <p className="mt-2 text-slate-600">
                Try a shorter business name if you cannot find your listing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                type="text"
                placeholder="Shop name, e.g. Coffee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                type="text"
                placeholder="City, e.g. Kitchener"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-full bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Search
              </button>
            </div>
          </section>

          {searched && (
            <section className="mt-8">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                    Search Results
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    {shops.length} matching{' '}
                    {shops.length === 1 ? 'business' : 'businesses'}
                  </h2>
                </div>
              </div>

              {shops.length > 0 ? (
                <div className="space-y-4">
                  {shops.map((shop) => {
                    const claim = existingClaims[shop.id];
                    const alreadyClaimed = Boolean(claim);
                    const listingHref =
                      shop.citySlug && shop.streetSlug
                        ? `/cities/${shop.citySlug}/${shop.streetSlug}/${shop.slug}`
                        : null;

                    return (
                      <div
                        key={shop.id}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            {listingHref ? (
                              <Link
                                href={listingHref}
                                target="_blank"
                                className="text-xl font-extrabold text-slate-950 transition hover:text-blue-700"
                              >
                                {shop.name}
                              </Link>
                            ) : (
                              <h3 className="text-xl font-extrabold text-slate-950">
                                {shop.name}
                              </h3>
                            )}

                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                              {shop.address && <p>Address: {shop.address}</p>}
                              {shop.streetName && <p>Street: {shop.streetName}</p>}
                              {shop.cityName && <p>City: {shop.cityName}</p>}
                            </div>

                            {listingHref && (
                              <Link
                                href={listingHref}
                                target="_blank"
                                className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
                              >
                                View public listing →
                              </Link>
                            )}
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => handleClaim(shop)}
                              disabled={submittingId === shop.id || alreadyClaimed}
                              className={`rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed max-sm:w-full ${
                                alreadyClaimed
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-blue-700 text-white hover:bg-blue-800'
                              }`}
                            >
                              {submittingId === shop.id
                                ? 'Submitting...'
                                : getClaimButtonText(shop.id)}
                            </button>
                          </div>
                        </div>

                        {!alreadyClaimed && (
                          <textarea
                            className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Optional: Tell us how you are connected to this business."
                            value={messages[shop.id] || ''}
                            onChange={(e) =>
                              setMessages((prev) => ({
                                ...prev,
                                [shop.id]: e.target.value,
                              }))
                            }
                          />
                        )}

                        {claim && (
                          <div
                            className={`mt-5 rounded-2xl border p-4 text-sm font-medium ${
                              claim.status === 'approved'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : claim.status === 'rejected'
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                          >
                            {claim.status === 'pending' &&
                              'Your claim request has been submitted and is waiting for review.'}
                            {claim.status === 'approved' &&
                              'Your claim has been approved. You can now manage this business from your Shop Owner dashboard.'}
                            {claim.status === 'rejected' &&
                              'Your claim was not approved. Please contact support if you believe this is a mistake.'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    No matching businesses found
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Try a shorter shop name, search by city only, or contact us
                    if your business is missing.
                  </p>

                  <Link
                    href="/contact-us"
                    className="mt-6 inline-flex rounded-full bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
                  >
                    Contact LocalStreetShop
                  </Link>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}