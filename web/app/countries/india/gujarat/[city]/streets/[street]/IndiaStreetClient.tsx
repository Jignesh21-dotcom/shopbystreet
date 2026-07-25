'use client';

import { useState } from 'react';
import Link from 'next/link';
import IndiaStreetStopsToggle from './IndiaStreetStopsToggle';

type StreetLocation = {
  id: string;
  name: string;
  slug: string;
  location_type: string;
};

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  street_number?: string | number | null;
  sequence?: number | null;
  parking?: string | null;
  category?: string | null;
  phone?: string | null;
  image_url?: string | null;
  location_id?: string | null;
  location?: StreetLocation | StreetLocation[] | null;
};

type AddressGroup = {
  address: string;
  streetNumber: number;
  shops: Shop[];
  locationId?: string | null;
  locationSlug?: string | null;
  locationType?: string | null;
};

type IndiaStreetClientProps = {
  state: string;
  stateName: string;
  city: string;
  cityName: string;
  street: string;
  streetName: string;
  shops: Shop[];
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const extractStreetNumber = (shop: Shop) => {
  if (
    shop.street_number !== null &&
    shop.street_number !== undefined &&
    shop.street_number !== ''
  ) {
    const parsedStreetNumber = Number(shop.street_number);

    if (!Number.isNaN(parsedStreetNumber)) {
      return parsedStreetNumber;
    }
  }

  const addressMatch = shop.address?.match(/^\s*(\d+)/);

  if (addressMatch) {
    return Number(addressMatch[1]);
  }

  return shop.sequence ?? 999999;
};

const getLocation = (shop: Shop) => {
  if (Array.isArray(shop.location)) return shop.location[0] || null;
  return shop.location || null;
};

const getAddress = (shop: Shop) => {
  const location = getLocation(shop);
  if (location?.name) return location.name;
  return shop.address?.trim() || `${shop.name}, address coming soon`;
};

const getSafeImageUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;

  const cleaned = rawUrl.trim();

  if (!cleaned || cleaned === '/' || cleaned === '#') {
    return null;
  }

  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('/')) {
    return cleaned;
  }

  return null;
};

export default function IndiaStreetClient({
  state,
  stateName,
  city,
  cityName,
  street,
  streetName,
  shops = [],
}: IndiaStreetClientProps) {
  const [search, setSearch] = useState('');

  const streetBasePath = `/countries/india/${state}/${city}/streets/${street}`;
  const cityPath = `/countries/india/${state}/${city}`;

  const filteredShops = shops.filter((shop) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      shop.name.toLowerCase().includes(query) ||
      shop.address?.toLowerCase().includes(query) ||
      shop.description?.toLowerCase().includes(query) ||
      shop.category?.toLowerCase().includes(query) ||
      shop.phone?.toLowerCase().includes(query)
    );
  });

  const addressGroups: AddressGroup[] = Object.values(
    filteredShops.reduce(
      (groups: Record<string, AddressGroup>, shop) => {
        const address = getAddress(shop);
        const streetNumber = extractStreetNumber(shop);

        if (!groups[address]) {
          groups[address] = {
            address,
            streetNumber,
            shops: [],
            locationId: getLocation(shop)?.id || null,
            locationSlug: getLocation(shop)?.slug || null,
            locationType: getLocation(shop)?.location_type || null,
          };
        }

        groups[address].shops.push(shop);

        return groups;
      },
      {}
    )
  ).sort((first, second) => first.streetNumber - second.streetNumber);

  const firstStop = addressGroups[0];

  const firstStopHref = firstStop
    ? `#stop-${slugify(firstStop.address)}`
    : '#walk-the-area';

  const totalBusinesses = shops.length;
  const totalStops = addressGroups.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={cityPath}
          prefetch={false}
          className="mb-6 inline-flex items-center text-sm font-semibold text-orange-700 hover:text-orange-900"
        >
          ← Back to {cityName}
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-green-600 px-6 py-10 text-white sm:px-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-orange-50">
              Gujarat Local Street Walk
            </p>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Walk {streetName}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
              Explore local shops, restaurants, services and businesses on{' '}
              {streetName} in walking order, just like exploring the area in
              real life.
            </p>

            {firstStop && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href={firstStopHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-bold text-orange-700 shadow-sm transition hover:bg-orange-50"
                >
                  🚶 Start Walk →
                </a>

                <p className="text-sm text-orange-50">
                  First stop:{' '}
                  <span className="font-semibold">{firstStop.address}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-orange-100 bg-white p-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-orange-50 p-5">
              <p className="text-3xl font-extrabold text-orange-700">
                {totalBusinesses}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Local businesses
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-5">
              <p className="text-3xl font-extrabold text-green-700">
                {totalStops}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Shopping stops
              </p>
            </div>

            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-3xl font-extrabold text-amber-700">
                {totalStops > 0 ? 'Ready' : 'Growing'}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Walk mode
              </p>
            </div>
          </div>
        </section>

        {addressGroups.length > 0 && (
          <section
            id="walk-the-area"
            className="mt-8 scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">
                  Street Walk Preview
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {addressGroups.length} stops on {streetName}
                </h2>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Start at the first location, then continue stop by stop to
                  explore businesses throughout the area.
                </p>
              </div>

              <a
                href={firstStopHref}
                className="rounded-full bg-orange-600 px-6 py-3 text-center font-bold text-white transition hover:bg-orange-700"
              >
                🚶 Start Walking →
              </a>
            </div>

            <IndiaStreetStopsToggle
              stops={addressGroups.map((group) => ({
                address: group.address,
                href: `#stop-${slugify(group.address)}`,
              }))}
            />
          </section>
        )}

        <section className="mt-8">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Search this area
          </label>

          <input
            type="text"
            placeholder="Search by business, address, category, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </section>

        {addressGroups.length > 0 ? (
          <div className="mt-8 space-y-8">
            {addressGroups.map((group, index) => {
              const addressAnchor = `stop-${slugify(group.address)}`;
              const nextGroup = addressGroups[index + 1];

              const nextStopHref = nextGroup
                ? `#stop-${slugify(nextGroup.address)}`
                : '#walk-the-area';

              const categoryCounts = group.shops.reduce(
                (counts: Record<string, number>, shop) => {
                  const category = shop.category || 'Other';

                  counts[category] = (counts[category] || 0) + 1;

                  return counts;
                },
                {}
              );

              return (
                <section
                  id={addressAnchor}
                  key={group.address}
                  className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
                        Stop {index + 1} of {addressGroups.length}
                      </p>

                      <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                        {group.address}
                      </h2>

                      {group.locationType && (
                        <p className="mt-2 text-sm font-semibold capitalize text-slate-500">
                          {group.locationType.replaceAll('_', ' ')}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(categoryCounts).map(
                          ([category, count]) => (
                            <span
                              key={category}
                              className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                            >
                              {category} ({count})
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700">
                        {group.shops.length}{' '}
                        {group.shops.length === 1
                          ? 'business'
                          : 'businesses'}
                      </span>

                      {group.locationSlug && (
                        <Link
                          href={`${streetBasePath}/locations/${group.locationSlug}`}
                          prefetch={false}
                          className="rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-center text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                        >
                          View Location →
                        </Link>
                      )}

                      <a
                        href={nextStopHref}
                        className="rounded-full bg-orange-600 px-5 py-2 text-center text-sm font-bold text-white transition hover:bg-orange-700"
                      >
                        {nextGroup ? 'Next Stop →' : 'Back to Walk Guide ↑'}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {group.shops.map((shop) => {
                      const safeImageUrl = getSafeImageUrl(shop.image_url);

                      return (
                        <Link
                          key={shop.id}
                          href={`${streetBasePath}/${shop.slug}`}
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
                            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 px-6 text-center text-sm font-semibold text-slate-500">
                              Storefront photo coming soon
                            </div>
                          )}

                          <div className="p-5">
                            <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-orange-700">
                              {shop.name}
                            </h3>

                            {shop.category && (
                              <p className="mt-2 text-sm font-bold text-orange-700">
                                {shop.category}
                              </p>
                            )}

                            {shop.address && (
                              <p className="mt-3 text-sm leading-6 text-slate-700">
                                📍 {shop.address}
                              </p>
                            )}

                            {shop.phone && (
                              <p className="mt-3 text-sm text-slate-600">
                                Phone: {shop.phone}
                              </p>
                            )}

                            {shop.description && (
                              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                {shop.description}
                              </p>
                            )}

                            {shop.parking && (
                              <p className="mt-4 text-sm text-slate-500">
                                Parking: {shop.parking}
                              </p>
                            )}

                            <p className="mt-5 font-bold text-orange-700">
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Founding Shopping Area
            </p>

            <h2 className="mt-3 text-2xl font-extrabold text-slate-950">
              Shops are being added
            </h2>

            <p className="mt-2 text-slate-600">
              {streetName} is ready in LocalStreetShop, and founding businesses
              will appear here as they are approved.
            </p>

            <Link
              href="/contact-us"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Recommend a shop
            </Link>
          </section>
        )}

        <section className="mt-8 rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-green-50 p-7 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
            {cityName}, {stateName}
          </p>

          <h2 className="mt-3 text-2xl font-black text-slate-950">
            Own a business on {streetName}?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
            Our upcoming submission form will allow business owners to submit
            their shop, full address and business details. Missing shopping
            streets or commercial areas can be created during approval.
          </p>
        </section>
      </div>
    </main>
  );
}