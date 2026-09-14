'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import USStreetStopsToggle from './USStreetStopsToggle';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  parking?: string | null;
  category?: string | null;
  phone?: string | null;
  street_number?: number | null;
  image_url?: string | null;
};

type AddressGroup = {
  address: string;
  streetNumber: number;
  shops: Shop[];
};

type Props = {
  state: string;
  stateName: string;
  city: string;
  cityName: string;
  street: string;
  streetName: string;
  shops: Shop[];
};

const naturalAddressCompare = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

const getSafeImageUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;
  const cleaned = rawUrl.trim();
  if (!cleaned || cleaned === '/' || cleaned === '#') return null;
  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('/')) return cleaned;
  return null;
};

// United States addresses can contain Block No., shop/unit numbers, fractions such as 71/2,
// floors, complexes and a 6-digit PIN. If street_number is already stored, use it.
// Otherwise derive a stable main number from the address for walk ordering.
const getStreetNumber = (shop: Shop) => {
  if (typeof shop.street_number === 'number' && Number.isFinite(shop.street_number)) {
    return shop.street_number;
  }

  const source = (shop.address || '')
    .replace(/\b\d{6}\b/g, ' ')
    .replace(/\s+/g, ' ');

  const matches = [...source.matchAll(/\b(\d{1,5})(?:\s*\/\s*\d{1,4})?[A-Za-z]?\b/g)];
  if (matches.length === 0) return 999999;

  // Prefer the final address-number style token. For an address such as
  // "Block No.-2, WHS, 71/2, Kirti Nagar" this correctly returns 71.
  const value = Number(matches[matches.length - 1][1]);
  return Number.isFinite(value) ? value : 999999;
};

export default function USStreetClient({
  state,
  stateName,
  city,
  cityName,
  street,
  streetName,
  shops = [],
}: Props) {
  const [search, setSearch] = useState('');
  const cityPath = `/countries/united-states/${state}/${city}`;

  const addressGroups = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filtered = shops.filter((shop) => {
      if (!query) return true;
      return (
        shop.name.toLowerCase().includes(query) ||
        shop.address?.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query) ||
        shop.phone?.toLowerCase().includes(query)
      );
    });

    return Object.values(
      filtered.reduce((groups: Record<string, AddressGroup>, shop) => {
        const address = shop.address?.trim() || `${shop.name}, address coming soon`;
        const streetNumber = getStreetNumber(shop);

        if (!groups[address]) {
          groups[address] = { address, streetNumber, shops: [] };
        }

        groups[address].shops.push(shop);
        return groups;
      }, {}),
    ).sort((first, second) => {
      if (first.streetNumber !== second.streetNumber) {
        return first.streetNumber - second.streetNumber;
      }
      return naturalAddressCompare.compare(first.address, second.address);
    });
  }, [shops, search]);

  const firstStopHref = addressGroups.length > 0 ? '#stop-1' : '#';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={cityPath}
          className="mb-6 inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to {cityName}
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-green-700 px-6 py-10 text-white sm:px-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-50">
              {stateName} Local Street Walk
            </p>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Walk {streetName}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
              Explore businesses in physical address order, stop by stop, just like walking the street in real life.
            </p>

            {addressGroups.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={firstStopHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  🚶 Start Walk →
                </Link>
                <p className="text-sm text-blue-50">
                  First stop: <span className="font-semibold">{addressGroups[0].address}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-blue-100 bg-white p-5 sm:grid-cols-3">
            <div className="rounded-3xl bg-blue-50 p-5">
              <p className="text-3xl font-extrabold text-blue-700">{shops.length}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Local businesses</p>
            </div>
            <div className="rounded-3xl bg-green-50 p-5">
              <p className="text-3xl font-extrabold text-green-700">{addressGroups.length}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Street stops</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-3xl font-extrabold text-amber-700">
                {addressGroups.length > 0 ? 'Ready' : 'Growing'}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">Walk mode</p>
            </div>
          </div>
        </section>

        {addressGroups.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Street Walk Preview</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {addressGroups.length} {addressGroups.length === 1 ? 'stop' : 'stops'} on {streetName}
                </h2>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Stops are automatically arranged by street/building number. Businesses sharing the same address stay together at one stop.
                </p>
              </div>
              <Link href={firstStopHref} className="rounded-full bg-blue-600 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-700">
                🚶 Start Walking →
              </Link>
            </div>

            <USStreetStopsToggle
              stops={addressGroups.map((group, index) => ({
                address: group.address,
                href: `#stop-${index + 1}`,
              }))}
            />
          </section>
        )}

        <section className="mt-8">
          <label className="mb-2 block text-sm font-bold text-slate-700">Search this street</label>
          <input
            type="text"
            placeholder="Search by business, address, category, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-orange-100"
          />
        </section>

        {addressGroups.length > 0 ? (
          <div className="mt-8 space-y-8">
            {addressGroups.map((group, index) => {
              const categoryCounts = group.shops.reduce((counts: Record<string, number>, shop) => {
                const category = shop.category || 'Other';
                counts[category] = (counts[category] || 0) + 1;
                return counts;
              }, {});

              const nextHref = index < addressGroups.length - 1 ? `#stop-${index + 2}` : '#street-top';

              return (
                <section
                  id={`stop-${index + 1}`}
                  key={group.address}
                  className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                        Stop {index + 1} of {addressGroups.length}
                      </p>
                      <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{group.address}</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(categoryCounts).map(([category, count]) => (
                          <span key={category} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                            {category} ({count})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700">
                        {group.shops.length} {group.shops.length === 1 ? 'business' : 'businesses'}
                      </span>
                      <Link href={nextHref} className="rounded-full bg-blue-600 px-5 py-2 text-center text-sm font-bold text-white transition hover:bg-blue-700">
                        {index < addressGroups.length - 1 ? 'Continue Walk →' : 'Back to Top ↑'}
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {group.shops.map((shop) => {
                      const safeImageUrl = getSafeImageUrl(shop.image_url);
                      return (
                        <Link
                          key={shop.id}
                          href={`/countries/united-states/${state}/${city}/streets/${street}/${shop.slug}`}
                          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          {safeImageUrl ? (
                            <img src={safeImageUrl} alt={`${shop.name} storefront`} className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 px-6 text-center text-sm font-semibold text-slate-500">
                              Storefront photo coming soon
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-blue-700">{shop.name}</h3>
                            {shop.category && <p className="mt-2 text-sm font-bold text-blue-700">{shop.category}</p>}
                            {shop.phone && <p className="mt-3 text-sm text-slate-600">Phone: {shop.phone}</p>}
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{shop.description || shop.address || 'Local business'}</p>
                            {shop.parking && <p className="mt-4 text-sm text-slate-500">Parking: {shop.parking}</p>}
                            <p className="mt-5 font-bold text-blue-700">View business →</p>
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
            <h2 className="text-2xl font-extrabold text-slate-950">No businesses found</h2>
            <p className="mt-2 text-slate-600">Try a different search term or explore another street in {cityName}.</p>
          </section>
        )}
      </div>
      <div id="street-top" />
    </main>
  );
}
