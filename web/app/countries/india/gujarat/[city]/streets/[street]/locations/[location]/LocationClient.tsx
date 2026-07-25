'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Shop = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  description?: string | null;
  parking?: string | null;
  category?: string | null;
  phone?: string | null;
  image_url?: string | null;
};

type LocationClientProps = {
  state: string;
  stateName: string;
  city: string;
  cityName: string;
  street: string;
  streetName: string;
  locationName: string;
  locationType: string;
  fullAddress?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  shops: Shop[];
};

const getSafeImageUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;
  const cleaned = rawUrl.trim();
  if (!cleaned || cleaned === '/' || cleaned === '#') return null;
  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('/')) return cleaned;
  return null;
};

export default function LocationClient({
  state,
  stateName,
  city,
  cityName,
  street,
  streetName,
  locationName,
  locationType,
  fullAddress,
  landmark,
  latitude,
  longitude,
  shops,
}: LocationClientProps) {
  const [search, setSearch] = useState('');

  const streetPath = `/countries/india/${state}/${city}/streets/${street}`;
  const query = search.trim().toLowerCase();

  const filteredShops = useMemo(() => {
    if (!query) return shops;
    return shops.filter((shop) =>
      [shop.name, shop.category, shop.address, shop.description, shop.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [query, shops]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    shops.forEach((shop) => {
      const category = shop.category?.trim() || 'Other';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [shops]);

  const mapsHref =
    latitude != null && longitude != null
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : fullAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
        : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <Link href="/countries/india" className="hover:text-orange-700">India</Link>
          <span>›</span>
          <Link href={`/countries/india/${state}`} className="hover:text-orange-700">{stateName}</Link>
          <span>›</span>
          <Link href={`/countries/india/${state}/${city}`} className="hover:text-orange-700">{cityName}</Link>
          <span>›</span>
          <Link href={streetPath} className="hover:text-orange-700">{streetName}</Link>
          <span>›</span>
          <span className="text-slate-950">{locationName}</span>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-green-600 px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-50">
              {locationType.replaceAll('_', ' ')} on {streetName}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{locationName}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
              Browse every approved local business inside {locationName} in {cityName}, {stateName}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`${streetPath}#stop-${locationName.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-bold text-orange-700 transition hover:bg-orange-50"
              >
                ← Back to Street Stop
              </Link>
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20"
                >
                  Open in Maps ↗
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-4 border-t border-orange-100 p-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-orange-50 p-5">
              <p className="text-3xl font-black text-orange-700">{shops.length}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Approved businesses</p>
            </div>
            <div className="rounded-3xl bg-green-50 p-5">
              <p className="text-3xl font-black text-green-700">{categories.length}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Categories available</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-xl font-black capitalize text-amber-700">{locationType.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Location type</p>
            </div>
          </div>
        </section>

        {(fullAddress || landmark) && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {fullAddress && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">Location Address</p>
                <p className="mt-3 leading-7 text-slate-700">{fullAddress}</p>
              </div>
            )}
            {landmark && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">Nearby Landmark</p>
                <p className="mt-3 leading-7 text-slate-700">{landmark}</p>
              </div>
            )}
          </section>
        )}

        {categories.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">What you can find here</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(([category, count]) => (
                <span key={category} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                  {category} ({count})
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <label className="mb-2 block text-sm font-bold text-slate-700">Search inside {locationName}</label>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by business, category, address, or phone..."
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </section>

        {filteredShops.length > 0 ? (
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => {
              const safeImageUrl = getSafeImageUrl(shop.image_url);
              return (
                <Link
                  key={shop.id}
                  href={`${streetPath}/${shop.slug}`}
                  prefetch={false}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {safeImageUrl ? (
                    <img src={safeImageUrl} alt={`${shop.name} storefront`} className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 px-6 text-center text-sm font-semibold text-slate-500">
                      Storefront photo coming soon
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-black text-slate-950 group-hover:text-orange-700">{shop.name}</h2>
                    {shop.category && <p className="mt-2 text-sm font-bold text-orange-700">{shop.category}</p>}
                    {shop.address && <p className="mt-3 text-sm leading-6 text-slate-700">📍 {shop.address}</p>}
                    {shop.phone && <p className="mt-3 text-sm text-slate-600">Phone: {shop.phone}</p>}
                    {shop.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{shop.description}</p>}
                    <p className="mt-5 font-bold text-orange-700">View business →</p>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-orange-300 bg-orange-50 p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">No matching businesses</h2>
            <p className="mt-3 text-slate-600">Try a different business name, category, address, or phone number.</p>
          </section>
        )}
      </div>
    </main>
  );
}
