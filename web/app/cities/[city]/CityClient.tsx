'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExpansionNotice from '@/app/components/ExpansionNotice';

type Street = {
  name: string | null;
  slug: string;
  shop_count?: number;
  featured_business?: string;
};

type CityClientProps = {
  cityName: string;
  citySlug: string;
  streets: Street[];
  isKitchenerDemo?: boolean;
};

export default function CityClient({
  cityName,
  citySlug,
  streets,
  isKitchenerDemo = false,
}: CityClientProps) {
  const [search, setSearch] = useState('');

  const filteredStreets = streets
    .filter((street) => street.name)
    .filter((street) =>
      street.name!.toLowerCase().includes(search.toLowerCase())
    );

  const totalBusinesses = streets.reduce(
    (sum, street) => sum + (street.shop_count ?? 0),
    0
  );

  const highlightText = (name: string) => {
    if (!search) return name;

    const parts = name.split(new RegExp(`(${search})`, 'gi'));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 rounded px-1">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/provinces/ontario"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back to Ontario
          </Link>

          <Link
            href="/live-cities"
            className="text-sm font-semibold text-green-700 hover:text-green-900 transition"
          >
            🏙️ View Live Cities
          </Link>
        </div>

        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8 md:p-10">
            <p className="text-sm uppercase tracking-widest text-blue-100 font-semibold mb-3">
              {isKitchenerDemo
                ? 'Downtown Kitchener Demo'
                : 'LocalStreetShop City Explorer'}
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Explore {cityName} Street by Street
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
              Discover local businesses the way you explore a city in real life.
              Choose a street, walk through shops, and support local.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
              <p className="text-3xl font-extrabold text-blue-700">
                {filteredStreets.length.toLocaleString()}
              </p>
              <p className="text-gray-600">Streets</p>
            </div>

            <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
              <p className="text-3xl font-extrabold text-green-700">
                {totalBusinesses.toLocaleString()}
              </p>
              <p className="text-gray-600">Businesses</p>
            </div>

            <a
              href="#street-list"
              className="rounded-2xl bg-purple-50 border border-purple-100 p-5 hover:bg-purple-100 transition block cursor-pointer"
            >
              <p className="text-3xl font-extrabold text-purple-700">Walk</p>
              <p className="text-gray-600">Street Experience</p>
              <p className="mt-2 text-sm font-semibold text-purple-700">
                Choose a street to start →
              </p>
            </a>
          </div>
        </section>

        <section id="street-list" className="scroll-mt-28">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
                Streets in {cityName}
              </p>

              <h2 className="text-3xl font-extrabold">
                Choose a street to explore
              </h2>
            </div>

            <input
              type="text"
              placeholder="Search for a street..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-4 w-full md:max-w-md rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
            />
          </div>

          {filteredStreets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreets.map((street) => (
                <Link
                  key={street.slug}
                  href={`/cities/${citySlug}/${street.slug}`}
                  className="group bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    <span className="text-white text-5xl">🏬</span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-blue-700 transition">
                      {highlightText(street.name!)}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {(street.shop_count ?? 0).toLocaleString()} businesses
                    </p>

                    {street.featured_business && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm">
                        <span className="font-semibold text-yellow-700">
                          Featured:
                        </span>{' '}
                        {street.featured_business}
                      </div>
                    )}

                    <div className="mt-5 text-blue-700 font-semibold">
                      Walk this street →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : citySlug.toLowerCase() === 'toronto' ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-600 text-lg shadow-sm">
              😕 No streets found matching &quot;{search}&quot;
            </div>
          ) : (
            <ExpansionNotice />
          )}
        </section>
      </div>
    </main>
  );
}