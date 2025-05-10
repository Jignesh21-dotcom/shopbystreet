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

  // Helper function to extract the base address number from the description
  const getBaseAddress = (description: string | undefined) => {
    if (!description) return Infinity; // Push shops without a description to the end
    const match = description.match(/^(\d+)/); // Match the first number in the description
    return match ? parseInt(match[1], 10) : Infinity;
  };

  // Sort shops numerically by their base address
  const sortedShops = [...shops].sort((a, b) => getBaseAddress(a.description) - getBaseAddress(b.description));

  // Filter shops based on the search input
  const filteredShops = sortedShops.filter((shop) =>
    shop.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      {/* Back to City */}
      <Link
        href={`/cities/${city}`}
        className="self-start mb-6 text-blue-700 hover:text-blue-900 hover:underline"
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
      {filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredShops.map((shop) => (
            <Link
              key={shop.id}
              href={`/cities/${city}/${street}/${shop.slug}`}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                {shop.name}
              </h3>
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
      ) : (
        <p className="text-gray-600 text-lg">No shops found on this street.</p>
      )}
    </div>
  );
}