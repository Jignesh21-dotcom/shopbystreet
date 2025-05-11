'use client';

import { useState } from 'react';
import Link from 'next/link';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parking?: string;
};

type StreetClientProps = {
  city: string;
  street: string;
  shops: Shop[];
};

export default function StreetClient({ city, street, shops }: StreetClientProps) {
  const [search, setSearch] = useState('');

  // Helper to extract address number for sorting
  const getBaseAddress = (description: string | undefined) => {
    if (!description) return Infinity;
    const match = description.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  // Enhanced function to extract plaza/mall/centre or fallback to address
  const getPlazaName = (description?: string) => {
    if (!description) return 'Other';

    // Match known plaza-like names
    const match = description.match(/(.+?\b(Plaza|Mall|Centre|Center)\b.*?)/i);
    if (match) return match[1].trim();

    // Fallback to base address without unit/suite
    const base = description
      .replace(/(Unit|Suite|#)\s*\d+/i, '')
      .replace(/,.*$/, '')
      .trim();

    return base || 'Other';
  };

  // Filter shops by search
  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group shops by plaza name
  const grouped = filteredShops.reduce((acc, shop) => {
    const plaza = getPlazaName(shop.description);
    if (!acc[plaza]) acc[plaza] = [];
    acc[plaza].push(shop);
    return acc;
  }, {} as Record<string, Shop[]>);

  // Sort groups alphabetically by plaza name
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <Link
        href={`/cities/${city}`}
        className="self-start mb-6 text-blue-700 hover:underline"
      >
        ← Back to City
      </Link>

      <h1 className="text-4xl font-bold text-blue-700 mb-8 capitalize">
        🏙️ Shops on {street}
      </h1>

      <input
        type="text"
        placeholder="Search for a shop..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {sortedGroups.length > 0 ? (
        <div className="w-full max-w-6xl space-y-10">
          {sortedGroups.map(([plaza, group]) => (
            <div key={plaza}>
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">{plaza}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {group
                  .sort((a, b) => getBaseAddress(a.description) - getBaseAddress(b.description))
                  .map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/cities/${city}/${street}/${shop.slug}`}
                      className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
                    >
                      <h3 className="text-xl font-semibold text-blue-700 mb-2">{shop.name}</h3>
                      <p className="text-gray-600 flex-1">
                        {shop.description || 'No description provided.'}
                      </p>
                      {shop.parking && (
                        <p className="text-sm text-gray-500 mt-4">
                          🚗 Parking: {shop.parking}
                        </p>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">No shops found on this street.</p>
      )}
    </div>
  );
}
