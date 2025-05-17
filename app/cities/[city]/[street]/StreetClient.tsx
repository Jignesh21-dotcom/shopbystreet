'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parking?: string;
};

type Segment = {
  id: string;
  name: string;
  slug: string;
  from_intersection: string;
  to_intersection: string;
  range_start: number;
  range_end: number;
};

type StreetClientProps = {
  province: string;
  city: string;
  street: string;
  shops: Shop[];
  segments: Segment[];
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300 px-1 rounded">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function extractBaseAddress(description: string = ''): string {
  const match = description.match(/\d+/);
  return match ? match[0] : '';
}

export default function StreetClient({ province, city, street, shops, segments }: StreetClientProps) {
  const [search, setSearch] = useState('');
  const [manuallyOpenedSegmentId, setManuallyOpenedSegmentId] = useState<string | null>(null);

  useEffect(() => {
    if (search) setManuallyOpenedSegmentId(null);
  }, [search]);

  const getBaseAddressNumber = (description: string | undefined) => {
    if (!description) return Infinity;
    const match = description.match(/^\d+/);
    return match ? parseInt(match[0], 10) : Infinity;
  };

  const groupedShops = shops.reduce((acc, shop) => {
    const base = extractBaseAddress(shop.description);
    if (!acc[base]) acc[base] = [];
    acc[base].push(shop);
    return acc;
  }, {} as Record<string, Shop[]>);

  const sortedGroupedEntries = Object.entries(groupedShops)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <Link href={`/cities/${city}`} className="self-start mb-6 text-blue-700 hover:underline">
        ← Back to City
      </Link>

      <h1 className="text-4xl font-bold text-blue-700 mb-8 capitalize">
        🌍 Shops on {street}
      </h1>

      <input
        type="text"
        placeholder="Search for a shop, address, number, or intersection..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="w-full max-w-6xl space-y-12">
        {sortedGroupedEntries.map(([address, shops]) => {
          const filteredShops = shops.filter((shop) =>
            `${shop.name} ${shop.description}`.toLowerCase().includes(search.toLowerCase())
          );
          if (filteredShops.length === 0) return null;

          return (
            <div key={address}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                🏢 {highlightMatch(address, search)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/cities/${city}/${street}/${shop.slug}`}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">
                      {highlightMatch(shop.name, search)}
                    </h3>
                    <p className="text-gray-600">
                      {highlightMatch(shop.description || 'No address available', search)}
                    </p>
                    {shop.parking && (
                      <p className="text-sm text-gray-500 mt-2">🚗 Parking: {shop.parking}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
