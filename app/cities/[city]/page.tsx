'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStreetsByCitySlug } from '@/lib/data';

export default async function CityPage({ params }: { params: { city: string } }) {
  const streets = await getStreetsByCitySlug(params.city);
  return <StreetList params={params} streets={streets} />;
}

function StreetList({ params, streets }: { params: { city: string }; streets: { name: string; slug: string }[] }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    // 🎯 Auto-clear on city switch
    setSearch('');
  }, [params.city]);

  const filteredStreets = streets.filter((street) =>
    street.name.toLowerCase().includes(search.toLowerCase())
  );

  const highlightText = (name: string) => {
    const parts = name.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-6 capitalize">
        🏙️ Streets in {params.city.charAt(0).toUpperCase() + params.city.slice(1)}
      </h1>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search for a street..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* 📍 Street List or No Results */}
      {filteredStreets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredStreets.map((street) => (
            <Link
              key={street.slug}
              href={`/cities/${params.city}/${street.slug}`}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 text-center"
            >
              <h2 className="text-xl font-semibold text-blue-700">
                {highlightText(street.name)}
              </h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-600 text-lg">
          😕 No streets found matching "<span className="font-semibold">{search}</span>"
        </div>
      )}
    </div>
  );
}
