'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCitiesByProvinceSlug } from '@/lib/data';

export default async function ProvincePage({ params }: { params: { province: string } }) {
  const cities = await getCitiesByProvinceSlug(params.province);
  return <CityList params={params} cities={cities} />;
}

function CityList({
  params,
  cities,
}: {
  params: { province: string };
  cities: { name: string; slug: string }[];
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Auto-clear search when switching provinces
    setSearch('');
  }, [params.province]);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  const highlightText = (name: string) => {
    if (!search) return name;
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
      {/* Back to Country */}
      <Link
        href="/countries/canada"
        className="self-start mb-6 text-blue-700 hover:text-blue-900 hover:underline"
      >
        ← Back to Canada
      </Link>

      {/* Province Title */}
      <h1 className="text-4xl font-bold text-blue-800 mb-6 capitalize">
        🗺️ {decodeURIComponent(params.province).replace(/-/g, ' ')}
      </h1>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search for a city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* 📍 Cities List or No Results */}
      {filteredCities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {filteredCities.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 text-center"
            >
              <h2 className="text-2xl font-semibold text-blue-700">{highlightText(city.name)}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-600 text-lg">
          😕 No cities found matching "<span className="font-semibold">{search}</span>"
        </div>
      )}
    </div>
  );
}
