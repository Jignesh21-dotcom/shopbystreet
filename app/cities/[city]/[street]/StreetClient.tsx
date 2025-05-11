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
  province: string;
  city: string;
  street: string;
  shops: Shop[];
};

export default function StreetClient({ province, city, street, shops }: StreetClientProps) {
  const [search, setSearch] = useState('');

  // Helper function to extract the base address number from the description
  const getBaseAddress = (description: string | undefined) => {
    if (!description) return Infinity; // Push shops without a description to the end
    const match = description.match(/^(\d+)/); // Match the first number in the description
    return match ? parseInt(match[1], 10) : Infinity;
  };

  // Helper function to extract the plaza/mall name from the description
  const getPlazaName = (description?: string) => {
    if (!description) return 'Other';
    const match = description.match(/(.+?\b(Plaza|Mall|Centre|Center)\b.*?)/i);
    if (match) return match[1].trim();
    const base = description
      .replace(/(Unit|Suite|#)\s*\d+/i, '') // Remove unit/suite numbers
      .replace(/,.*$/, '') // Remove everything after a comma
      .trim();
    return base || 'Other';
  };

  // Step 1: Filter and sort all shops by address
  const filteredShops = shops
    .filter((shop) => shop.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getBaseAddress(a.description) - getBaseAddress(b.description));

  // Step 2: Build display blocks preserving order
  const displayBlocks: { plaza: string; items: Shop[] }[] = [];

  for (const shop of filteredShops) {
    const plaza = getPlazaName(shop.description);
    const lastBlock = displayBlocks[displayBlocks.length - 1];

    if (!lastBlock || lastBlock.plaza !== plaza) {
      displayBlocks.push({ plaza, items: [shop] });
    } else {
      lastBlock.items.push(shop);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      {/* Back to City Link */}
      <Link
        href={`/cities/${city}`} // Corrected to point to the city route
        className="self-start mb-6 text-blue-700 hover:underline"
      >
        ← Back to City
      </Link>

      {/* Street Title */}
      <h1 className="text-4xl font-bold text-blue-700 mb-8 capitalize">
        🏙️ Shops on {street}
      </h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a shop..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Shops List */}
      {displayBlocks.length > 0 ? (
        <div className="w-full max-w-6xl space-y-10">
          {displayBlocks.map((block, i) => (
            <div key={`${block.plaza}-${i}`}>
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">{block.plaza}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {block.items.map((shop) => (
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