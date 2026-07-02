'use client';

import { useState } from 'react';
import Link from 'next/link';
import StreetStopsToggle from './StreetStopsToggle'

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parking?: string;
  address?: string;
  category?: string;
  phone?: string;
  street_number?: number;
  image_url?: string;
};

type AddressGroup = {
  address: string;
  streetNumber: number;
  shops: Shop[];
};

type StreetClientProps = {
  province: string;
  city: string;
  street: string;
  streetName?: string;
  isKitchenerDemo?: boolean;
  shops?: Shop[];
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const formatName = (text: string) =>
  text
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSafeImageUrl = (rawUrl: string | undefined, currentStreetPath: string) => {
  if (!rawUrl) return null;

  const cleaned = rawUrl.trim();
  if (!cleaned || cleaned === '/' || cleaned === '#') return null;

  if (cleaned === currentStreetPath || cleaned === `${currentStreetPath}/`) {
    return null;
  }

  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('/')) {
    return cleaned;
  }

  return null;
};

export default function StreetClient({
  province,
  city,
  street,
  streetName,
  isKitchenerDemo = false,
  shops = [],
}: StreetClientProps) {
  const [search, setSearch] = useState('');

  const displayStreetName = streetName || formatName(street);
  const displayCityName = formatName(city);
  const currentStreetPath = `/cities/${city}/${street}`;

  const filteredShops = shops
    .filter((shop) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      return (
        shop.name.toLowerCase().includes(query) ||
        shop.address?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query) ||
        shop.phone?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => (a.street_number || 0) - (b.street_number || 0));

  const addressGroups: AddressGroup[] = Object.values(
    filteredShops.reduce((acc: Record<string, AddressGroup>, shop) => {
      const address = shop.address || `Address #${shop.street_number || '?'}`;
      const streetNumber = shop.street_number || 999999;

      if (!acc[address]) {
        acc[address] = {
          address,
          streetNumber,
          shops: [],
        };
      }

      acc[address].shops.push(shop);
      return acc;
    }, {})
  ).sort((a, b) => a.streetNumber - b.streetNumber);

  const firstStop = addressGroups[0];
  const firstStopHref = firstStop
    ? `/cities/${city}/${street}/address/${slugify(firstStop.address)}`
    : '#';

  const totalBusinesses = shops.length;
  const totalStops = addressGroups.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/cities/${city}`}
          prefetch={false}
          className="mb-6 inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to {displayCityName}
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white sm:px-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              {isKitchenerDemo
                ? 'Downtown Kitchener Street Walk'
                : 'Local Street Walk'}
            </p>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Walk {displayStreetName}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
              Explore local shops, restaurants, services, and businesses on{' '}
              {displayStreetName} in address order, just like walking the street
              in real life.
            </p>

            {firstStop && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={firstStopHref}
                  prefetch={false}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  🚶 Start Walk →
                </Link>

                <p className="text-sm text-blue-50">
                  First stop:{' '}
                  <span className="font-semibold">{firstStop.address}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-blue-100 bg-white p-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-blue-50 p-5">
              <p className="text-3xl font-extrabold text-blue-700">
                {totalBusinesses}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Local businesses
              </p>
            </div>

            <div className="rounded-3xl bg-indigo-50 p-5">
              <p className="text-3xl font-extrabold text-indigo-700">
                {totalStops}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Street stops
              </p>
            </div>

            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-3xl font-extrabold text-amber-700">
                {totalStops > 0 ? 'Ready' : 'Empty'}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Walk mode
              </p>
            </div>
          </div>
        </section>

        {addressGroups.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                  Street Walk Preview
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {addressGroups.length} stops on {displayStreetName}
                </h2>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Start at the first address, then continue stop by stop to
                  explore businesses along the street.
                </p>
              </div>

              <Link
                href={firstStopHref}
                prefetch={false}
                className="rounded-full bg-blue-700 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-800"
              >
                🚶 Start Walking →
              </Link>
            </div>

            <StreetStopsToggle
  stops={addressGroups.map((group) => ({
    address: group.address,
    href: `/cities/${city}/${street}/address/${slugify(group.address)}`,
  }))}
/>
          </section>
        )}

        <section className="mt-8">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Search this street
          </label>

          <input
            type="text"
            placeholder="Search by business, address, category, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </section>

        {addressGroups.length > 0 ? (
          <div className="mt-8 space-y-8">
            {addressGroups.map((group, index) => {
              const addressHref = `/cities/${city}/${street}/address/${slugify(
                group.address
              )}`;

              const categoryCounts = group.shops.reduce(
                (acc: Record<string, number>, shop) => {
                  const category = shop.category || 'Other';
                  acc[category] = (acc[category] || 0) + 1;
                  return acc;
                },
                {}
              );

              return (
                <section
                  key={`list-${group.address}`}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                        Stop {index + 1} of {addressGroups.length}
                      </p>

                      <Link
                        href={addressHref}
                        prefetch={false}
                        className="mt-2 inline-block text-2xl font-extrabold text-slate-950 transition hover:text-blue-700"
                      >
                        {group.address}
                      </Link>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(categoryCounts).map(([category, count]) => (
                          <span
                            key={category}
                            className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                          >
                            {category} ({count})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700">
                        {group.shops.length}{' '}
                        {group.shops.length === 1 ? 'business' : 'businesses'}
                      </span>

                      <Link
                        href={addressHref}
                        prefetch={false}
                        className="rounded-full bg-blue-700 px-5 py-2 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                      >
                        Continue Walk →
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {group.shops.map((shop) => {
                      const safeImageUrl = getSafeImageUrl(shop.image_url, currentStreetPath);

                      return (
                        <Link
                          key={shop.id}
                          href={`/cities/${city}/${street}/${shop.slug}`}
                          prefetch={false}
                          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          {safeImageUrl ? (
                            <img
                              src={safeImageUrl}
                              alt={`${shop.name} storefront`}
                              className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-6 text-center text-sm font-semibold text-slate-500">
                              Storefront photo coming soon
                            </div>
                          )}

                          <div className="p-5">
                            <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-blue-700">
                              {shop.name}
                            </h3>

                            {shop.category && (
                              <p className="mt-2 text-sm font-bold text-blue-700">
                                {shop.category}
                              </p>
                            )}

                            {shop.phone && (
                              <p className="mt-3 text-sm text-slate-600">
                                Phone: {shop.phone}
                              </p>
                            )}

                            {!isKitchenerDemo && (
                              <>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                  {shop.description ||
                                    shop.address ||
                                    'Address details coming soon.'}
                                </p>

                                {shop.parking && (
                                  <p className="mt-4 text-sm text-slate-500">
                                    Parking: {shop.parking}
                                  </p>
                                )}
                              </>
                            )}

                            <p className="mt-5 font-bold text-blue-700">
                              View business →
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">
              No businesses found
            </h2>
            <p className="mt-2 text-slate-600">
              Try a different search term or explore another street in{' '}
              {displayCityName}.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}