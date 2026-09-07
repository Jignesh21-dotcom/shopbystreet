'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SEO from '@/app/components/SEO';
import { supabase } from '@/lib/supabaseClient';

type Location = {
  slug: string;
  name: string;
};

type ActiveShop = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  address: string | null;
  imageUrl: string | null;
  street: Location;
  city: Location;
  region: Location;
  country: Location;
  productCount: number;
};

const unwrap = <T,>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? value[0] || null : value || null;

const normalizeSlug = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, '-');

const getShopHref = (shop: ActiveShop) => {
  if (normalizeSlug(shop.country.slug) === 'india') {
    return `/countries/india/${encodeURIComponent(
      shop.region.slug
    )}/${encodeURIComponent(shop.city.slug)}/streets/${encodeURIComponent(
      shop.street.slug
    )}/${encodeURIComponent(shop.slug)}`;
  }

  return `/cities/${encodeURIComponent(shop.city.slug)}/${encodeURIComponent(
    shop.street.slug
  )}/${encodeURIComponent(shop.slug)}`;
};

export default function ActiveShopsClient() {
  const searchParams = useSearchParams();
  const requestedCountry = normalizeSlug(searchParams.get('country') || 'canada');
  const activeCountry = requestedCountry === 'india' ? 'india' : 'canada';
  const countryLabel = activeCountry === 'india' ? 'India' : 'Canada';

  const [shops, setShops] = useState<ActiveShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productsOnly, setProductsOnly] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveShops = async () => {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('shops')
        .select(`
          id,
          name,
          slug,
          category,
          address,
          image_url,
          street:street_id (
            slug,
            name,
            city:city_id (
              slug,
              name,
              province:province_id (
                slug,
                name,
                country:countries (
                  slug,
                  name
                )
              )
            )
          ),
          products (count)
        `)
        .eq('approved', true)
        .not('owner_id', 'is', null);

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load active shops:', error);
        setErrorMessage('We could not load active shops right now. Please try again shortly.');
        setShops([]);
        setLoading(false);
        return;
      }

      const normalized = (data || []).flatMap((row: any) => {
        const street = unwrap<any>(row.street);
        const city = unwrap<any>(street?.city);
        const region = unwrap<any>(city?.province);
        const country = unwrap<any>(region?.country);

        if (!street || !city || !region || !country) return [];
        if (normalizeSlug(country.slug || '') !== activeCountry) return [];

        return [{
          id: row.id,
          name: row.name,
          slug: row.slug,
          category: row.category || null,
          address: row.address || null,
          imageUrl: row.image_url || null,
          street: { slug: street.slug, name: street.name },
          city: { slug: city.slug, name: city.name },
          region: { slug: region.slug, name: region.name },
          country: { slug: country.slug, name: country.name },
          productCount: Number(unwrap<any>(row.products)?.count) || 0,
        }];
      });

      normalized.sort(
        (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)
      );

      setShops(normalized);
      setLoading(false);
    };

    fetchActiveShops();

    return () => {
      isMounted = false;
    };
  }, [activeCountry]);

  useEffect(() => {
    setCityFilter('all');
    setCategoryFilter('all');
    setProductsOnly(false);
  }, [activeCountry]);

  const cities = useMemo(
    () =>
      [...new Map(shops.map((shop) => [shop.city.slug, shop.city])).values()].sort(
        (a, b) => a.name.localeCompare(b.name)
      ),
    [shops]
  );

  const categories = useMemo(
    () =>
      [...new Set(shops.map((shop) => shop.category).filter(Boolean) as string[])].sort(
        (a, b) => a.localeCompare(b)
      ),
    [shops]
  );

  const visibleShops = useMemo(
    () =>
      shops.filter(
        (shop) =>
          (cityFilter === 'all' || shop.city.slug === cityFilter) &&
          (categoryFilter === 'all' || shop.category === categoryFilter) &&
          (!productsOnly || shop.productCount > 0)
      ),
    [categoryFilter, cityFilter, productsOnly, shops]
  );

  const shopsWithProducts = shops.filter((shop) => shop.productCount > 0).length;
  const title = `${countryLabel} Active Shops | LocalStreetShop`;
  const description = `Explore approved ${countryLabel} shop profiles managed directly by local business owners on LocalStreetShop.`;

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={`https://www.localstreetshop.com/active-shops?country=${activeCountry}`}
      />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/live-cities?country=${activeCountry}`}
            className="mb-8 inline-block text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            ← Back to {countryLabel} Live Cities
          </Link>

          <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-10 text-white shadow-xl sm:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Owner-managed profiles
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Explore Active Shops
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100">
              Discover approved LocalStreetShop profiles managed directly by their business owners. Shops with products are shown first.
            </p>

            {!loading && !errorMessage && (
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
                <span className="rounded-full bg-white/15 px-4 py-2">
                  ✓ {shops.length} owner-managed {shops.length === 1 ? 'shop' : 'shops'}
                </span>
                <span className="rounded-full bg-white/15 px-4 py-2">
                  🛍️ {shopsWithProducts} with products
                </span>
              </div>
            )}
          </section>

          {!loading && !errorMessage && shops.length > 0 && (
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm font-bold text-slate-700">
                  City
                  <select
                    value={cityFilter}
                    onChange={(event) => setCityFilter(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All cities</option>
                    {cities.map((city) => (
                      <option key={city.slug} value={city.slug}>{city.name}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold text-slate-700">
                  Category
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">
                  <input
                    type="checkbox"
                    checked={productsOnly}
                    onChange={(event) => setProductsOnly(event.target.checked)}
                    className="h-5 w-5 accent-blue-700"
                  />
                  Show only shops with products
                </label>
              </div>
            </section>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-700">Loading active shops...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && shops.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold">Active shops are coming soon</h2>
              <p className="mt-2 text-slate-600">Owner-managed shops will appear here after approval.</p>
            </div>
          )}

          {!loading && !errorMessage && shops.length > 0 && visibleShops.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold">No shops match these filters</h2>
              <button
                type="button"
                onClick={() => {
                  setCityFilter('all');
                  setCategoryFilter('all');
                  setProductsOnly(false);
                }}
                className="mt-4 font-semibold text-blue-700 hover:text-blue-900"
              >
                Clear filters
              </button>
            </div>
          )}

          {visibleShops.length > 0 && (
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{countryLabel}</p>
                  <h2 className="mt-1 text-2xl font-extrabold">Owner-managed local businesses</h2>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {visibleShops.length} {visibleShops.length === 1 ? 'result' : 'results'}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleShops.map((shop) => (
                  <article
                    key={shop.id}
                    className="group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                  >
                    {shop.imageUrl ? (
                      <img
                        src={shop.imageUrl}
                        alt={`${shop.name} storefront`}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-5xl" aria-hidden="true">
                        🏪
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          ✓ Owner Managed
                        </span>
                        {shop.productCount > 0 && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                            🛍️ {shop.productCount} {shop.productCount === 1 ? 'Product' : 'Products'}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-xl font-extrabold text-slate-950 transition group-hover:text-blue-700">
                        {shop.name}
                      </h3>
                      {shop.category && <p className="mt-1 text-sm font-medium text-slate-500">{shop.category}</p>}
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {shop.street.name}, {shop.city.name}
                      </p>
                      {shop.address && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{shop.address}</p>}

                      <Link
                        href={getShopHref(shop)}
                        className="mt-5 inline-flex items-center font-bold text-blue-700 transition hover:text-blue-900"
                      >
                        {shop.productCount > 0 ? 'Explore Shop & Products' : 'Explore Shop'} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
