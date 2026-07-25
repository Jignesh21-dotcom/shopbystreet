'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

const normalizeShop = (shop: any): ClaimResult => {
  let street = shop?.street;

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
    address: shop.address || undefined,
    streetName: street?.name || undefined,
    streetSlug: street?.slug || undefined,
    cityName: street?.city?.name || undefined,
    citySlug: street?.city?.slug || undefined,
  };
};

const getClaimButtonText = (claim: ExistingClaim | undefined) => {
  if (!claim) return 'Submit claim request';
  if (claim.status === 'approved') return 'Claim approved';
  if (claim.status === 'rejected') return 'Claim rejected';
  return 'Claim pending';
};

export default function ClaimShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supports all three so older/newer links can work:
  // /shop-owner/claim?shopId=UUID
  // /shop-owner/claim?shop=UUID
  // /shop-owner/claim?id=UUID
  const selectedShopId =
    searchParams.get('shopId') ||
    searchParams.get('shop') ||
    searchParams.get('id') ||
    '';

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [shops, setShops] = useState<ClaimResult[]>([]);
  const [selectedShop, setSelectedShop] = useState<ClaimResult | null>(null);
  const [existingClaims, setExistingClaims] = useState<
    Record<string, ExistingClaim>
  >({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loadingSelectedShop, setLoadingSelectedShop] = useState(false);
  const [selectedShopError, setSelectedShopError] = useState('');

  const fetchShopById = useCallback(async (shopId: string) => {
    setLoadingSelectedShop(true);
    setSelectedShopError('');

    const { data, error } = await supabase
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
      `,
      )
      .eq('id', shopId)
      .maybeSingle();

    if (error) {
      console.error('Unable to load selected shop:', error.message);
      setSelectedShopError(error.message);
      setSelectedShop(null);
      setLoadingSelectedShop(false);
      return;
    }

    if (!data) {
      setSelectedShopError('This business listing could not be found.');
      setSelectedShop(null);
      setLoadingSelectedShop(false);
      return;
    }

    setSelectedShop(normalizeShop(data));
    setLoadingSelectedShop(false);
  }, []);

  useEffect(() => {
    const fetchUserAndClaims = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        const returnPath = selectedShopId
          ? `/shop-owner/claim?shopId=${encodeURIComponent(selectedShopId)}`
          : '/shop-owner/claim';

        router.push(`/login?redirect=${encodeURIComponent(returnPath)}`);
        return;
      }

      setUser(data.user);

      const { data: claims, error } = await supabase
        .from('shop_claims')
        .select('id, shop_id, status')
        .eq('user_id', data.user.id);

      if (error) {
        console.error('Failed to fetch user claims:', error.message);
      } else {
        const claimMap = (claims || []).reduce(
          (acc: Record<string, ExistingClaim>, claim: ExistingClaim) => {
            acc[claim.shop_id] = claim;
            return acc;
          },
          {},
        );

        setExistingClaims(claimMap);
      }

      if (selectedShopId) {
        await fetchShopById(selectedShopId);
      }
    };

    fetchUserAndClaims();
  }, [fetchShopById, router, selectedShopId]);

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
      `,
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

    const normalized = (data || [])
      .map(normalizeShop)
      .filter((shop) => {
        if (!cityQuery) return true;

        return (
          shop.cityName?.toLowerCase().includes(cityQuery) ||
          shop.citySlug?.toLowerCase().includes(cityQuery)
        );
      });

    const unique = Array.from(
      new Map(normalized.map((shop) => [shop.id, shop])).values(),
    );

    setShops(unique);
  };

  const handleClaim = async (shop: ClaimResult) => {
    if (!user || existingClaims[shop.id]) return;

    setSubmittingId(shop.id);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        alert('❌ Your session has expired. Please log in again.');

        const returnPath = `/shop-owner/claim?shopId=${encodeURIComponent(shop.id)}`;
        router.push(`/login?redirect=${encodeURIComponent(returnPath)}`);
        return;
      }

      const response = await fetch('/api/shop-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          shopId: shop.id,
          shopName: shop.name,
          shopAddress: shop.address || null,
          shopCity: shop.cityName || null,
          shopStreet: shop.streetName || null,
          message: messages[shop.id]?.trim() || '',
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

      setMessages((prev) => ({
        ...prev,
        [shop.id]: '',
      }));

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

  const renderClaimCard = (shop: ClaimResult, highlighted = false) => {
    const claim = existingClaims[shop.id];
    const alreadyClaimed = Boolean(claim);

    return (
      <div
        key={shop.id}
        className={`rounded-[1.5rem] border bg-white p-5 shadow-sm sm:p-6 ${
          highlighted
            ? 'border-blue-300 ring-4 ring-blue-100'
            : 'border-slate-200'
        }`}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            {highlighted && (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Selected business
              </p>
            )}

            <h3 className="text-2xl font-extrabold text-slate-950">
              {shop.name}
            </h3>

            <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
              {shop.address && <p><strong>Address:</strong> {shop.address}</p>}
              {shop.streetName && <p><strong>Street:</strong> {shop.streetName}</p>}
              {shop.cityName && <p><strong>City:</strong> {shop.cityName}</p>}
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleClaim(shop)}
              disabled={submittingId === shop.id || alreadyClaimed}
              className={`rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed max-sm:w-full ${
                alreadyClaimed
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {submittingId === shop.id
                ? 'Submitting...'
                : getClaimButtonText(claim)}
            </button>
          </div>
        </div>

        {!alreadyClaimed && (
          <div className="mt-5">
            <label
              htmlFor={`claim-message-${shop.id}`}
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Message to the administrator (optional)
            </label>

            <textarea
              id={`claim-message-${shop.id}`}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Tell us how you are connected to this business."
              value={messages[shop.id] || ''}
              onChange={(event) =>
                setMessages((prev) => ({
                  ...prev,
                  [shop.id]: event.target.value,
                }))
              }
            />
          </div>
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
  };

  const directClaimMode = Boolean(selectedShopId);

  return (
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
  {directClaimMode && selectedShop
    ? `Claim ${selectedShop.name}`
    : 'Claim your business listing'}
</h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:mt-5 sm:text-lg sm:leading-8">
  {directClaimMode && selectedShop
    ? `You're about to claim ${selectedShop.name}. Once approved, you'll be able to manage the listing, add products, update business information, and more.`
    : 'Search for your business and submit a claim request. Once approved, you can manage your listing, update details, and add products from your Shop Owner dashboard.'}
</p>
        </section>

        {directClaimMode ? (
          <section className="mt-8">
            {loadingSelectedShop ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                Loading selected business...
              </div>
            ) : selectedShopError ? (
              <div className="rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Unable to open this business
                </h2>
                <p className="mt-3 text-red-700">{selectedShopError}</p>
                <Link
                  href="/shop-owner/claim"
                  className="mt-6 inline-flex rounded-full bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
                >
                  Search for a business instead
                </Link>
              </div>
            ) : selectedShop ? (
              <>
                {renderClaimCard(selectedShop, true)}

                <div className="mt-5 text-center">
                  <Link
                    href="/shop-owner/claim"
                    className="text-sm font-bold text-blue-700 hover:text-blue-900"
                  >
                    This is not my business — search for another listing
                  </Link>
                </div>
              </>
            ) : null}
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                  Find your shop
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Search by business name and city
                </h2>

                <p className="mt-2 text-slate-600">
                  This shared search works for businesses in both Canada and India.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Business name, e.g. Coffee"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch();
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <input
                  type="text"
                  placeholder="City, e.g. Kitchener or Vadodara"
                  value={citySearch}
                  onChange={(event) => setCitySearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch();
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
                <div className="mb-4">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                    Search Results
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    {shops.length} matching{' '}
                    {shops.length === 1 ? 'business' : 'businesses'}
                  </h2>
                </div>

                {shops.length > 0 ? (
                  <div className="space-y-4">
                    {shops.map((shop) => renderClaimCard(shop))}
                  </div>
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                    <h2 className="text-2xl font-extrabold text-slate-950">
                      No matching businesses found
                    </h2>

                    <p className="mt-2 text-slate-600">
                      Try a shorter business name, search by city only, or contact
                      us if your business is missing.
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
          </>
        )}
      </div>
    </main>
  );
}