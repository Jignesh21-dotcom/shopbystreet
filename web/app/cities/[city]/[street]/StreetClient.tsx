'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export default function StreetClient({
  province,
  city,
  street,
  streetName,
  isKitchenerDemo = false,
  shops = [],
}: StreetClientProps) {
  const [search, setSearch] = useState('');

  const displayStreetName = streetName || street.replace(/-/g, ' ');

  const filteredShops = shops
    .filter((shop) => {
      const query = search.toLowerCase();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/cities/${city}`}
          className="inline-block mb-6 text-blue-700 hover:text-blue-900 hover:underline"
        >
          ← Back to {city}
        </Link>

        <section className="bg-white rounded-3xl shadow-lg overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-10">
            <p className="text-sm uppercase tracking-widest opacity-90 mb-3">
              {isKitchenerDemo
                ? 'Downtown Kitchener Virtual Street Walk'
                : 'Local Street Shop'}
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
              Walk {displayStreetName}
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mb-8">
              Explore businesses stop by stop in address order, like walking
              down the street in real life.
            </p>

            {firstStop && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Link
                  href={firstStopHref}
                  className="inline-flex items-center justify-center bg-white text-blue-700 px-7 py-4 rounded-2xl font-bold shadow-md hover:bg-blue-50 transition"
                >
                  🚶 Start Walk
                </Link>

                <p className="text-blue-100">
                  First stop:{' '}
                  <span className="font-semibold">{firstStop.address}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-3xl font-bold text-blue-700">{shops.length}</p>
              <p className="text-gray-600">Businesses</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-3xl font-bold text-green-700">
                {addressGroups.length}
              </p>
              <p className="text-gray-600">Street Stops</p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-3xl font-bold text-purple-700">
                {addressGroups.length > 0 ? 'Ready' : 'Empty'}
              </p>
              <p className="text-gray-600">Walk Mode</p>
            </div>
          </div>
        </section>

        {addressGroups.length > 0 && (
          <section className="bg-white rounded-3xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                  Virtual Walk Preview
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {addressGroups.length} stops on {displayStreetName}
                </h2>
                <p className="text-gray-600 mt-2">
                  Start at the first address, then move forward using Previous
                  Stop and Next Stop.
                </p>
              </div>

              <Link
                href={firstStopHref}
                className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-800 transition text-center"
              >
                Start Walking →
              </Link>
            </div>

            <div className="mt-6 h-3 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-full" />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {addressGroups.map((group) => (
                <Link
                  key={`preview-${group.address}`}
                  href={`/cities/${city}/${street}/address/${slugify(group.address)}`}
                  className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-full transition"
                >
                  {group.address}
                </Link>
              ))}
            </div>
          </section>
        )}

        <input
          type="text"
          placeholder="Search by business, address, category, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 p-4 w-full max-w-xl rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />

        {addressGroups.length > 0 ? (
          <div className="space-y-8 w-full">
            {addressGroups.map((group, index) => {
              const addressHref = `/cities/${city}/${street}/address/${slugify(
                group.address
              )}`;

              return (
                <section
                  key={`list-${group.address}`}
                  className="bg-white rounded-3xl shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 border-b pb-4">
                    <div>
                      <p className="text-sm font-bold text-blue-600">
                        Stop {index + 1} of {addressGroups.length}
                      </p>

                      <Link
                        href={addressHref}
                        className="inline-block text-2xl font-bold text-blue-800 hover:text-blue-600 hover:underline"
                      >
                        📍 {group.address}
                      </Link>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(
                          group.shops.reduce((acc: Record<string, number>, shop) => {
                            const category = shop.category || 'Other';
                            acc[category] = (acc[category] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([category, count]) => (
                          <span
                            key={category}
                            className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {category} ({count})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-center">
                        {group.shops.length}{' '}
                        {group.shops.length === 1 ? 'business' : 'businesses'}
                      </span>

                      <Link
                        href={addressHref}
                        className="bg-blue-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-800 transition text-center"
                      >
                        Continue Walk →
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.shops.map((shop) => (
                      <Link
                        key={shop.id}
                        href={`/cities/${city}/${street}/${shop.slug}`}
                        className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition overflow-hidden"
                      >
                        {shop.image_url ? (
                          <img
                            src={shop.image_url}
                            alt={`${shop.name} storefront`}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="h-44 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-gray-500 text-sm font-semibold">
                            🏪 Storefront photo coming soon
                          </div>
                        )}

                        <div className="p-5">
                          <h3 className="text-xl font-bold text-blue-700">
                            {shop.name}
                          </h3>

                          {shop.category && (
                            <p className="text-sm text-purple-600 font-medium mt-1">
                              {shop.category}
                            </p>
                          )}

                          {shop.phone && (
                            <p className="text-gray-600 mt-3">📞 {shop.phone}</p>
                          )}

                          {!isKitchenerDemo && (
                            <>
                              <p className="text-gray-600 mt-3">
                                {shop.description || shop.address || 'No address available.'}
                              </p>

                              {shop.parking && (
                                <p className="text-sm text-gray-500 mt-4">
                                  🚗 Parking: {shop.parking}
                                </p>
                              )}
                            </>
                          )}

                          <p className="mt-4 text-blue-700 font-semibold">
                            View business →
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No businesses found.</p>
        )}
      </div>
    </div>
  );
}