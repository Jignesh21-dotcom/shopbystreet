'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getShopsByStreetSlug } from '@/lib/data';

export default function StreetPage({ params }: { params: { city: string; street: string } }) {
  const [shops, setShops] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load shops and favorites on mount
  useEffect(() => {
    getShopsByStreetSlug(params.street).then(setShops);

    const favs = localStorage.getItem('favorites');
    setFavorites(favs ? JSON.parse(favs) : []);

    // ⏱️ Track street visit
    const visitedKey = 'visitedStreets';
    const current = params.street;
    const stored = localStorage.getItem(visitedKey);
    const visited: string[] = stored ? JSON.parse(stored) : [];

    if (!visited.includes(current)) {
      visited.push(current);
      localStorage.setItem(visitedKey, JSON.stringify(visited));
    }
  }, [params.street]);

  const toggleFavorite = (slug: string) => {
    const updated = favorites.includes(slug)
      ? favorites.filter((s) => s !== slug)
      : [...favorites, slug];

    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col items-center">
      {/* Back to City */}
      <Link
        href={`/provinces/${params.city}`}
        className="self-start mb-6 text-pink-700 hover:text-pink-900 hover:underline"
      >
        ← Back to City
      </Link>

      {/* Street Title */}
      <h1 className="text-4xl font-bold text-pink-800 mb-2 capitalize">
        🚶 {decodeURIComponent(params.street).replace(/-/g, ' ')}
      </h1>

      {/* 🗺️ Google Maps Mini Preview */}
      <div className="w-full max-w-4xl mt-4 mb-10">
        <iframe
          title="Map preview"
          width="100%"
          height="300"
          loading="lazy"
          style={{ borderRadius: '12px', border: 0 }}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyArtH_bWsU80apkjf203NqNIdnqDFx0PKY&q=${encodeURIComponent(decodeURIComponent(params.street))},Toronto`}
        ></iframe>
      </div>

      <p className="text-pink-600 mb-6">
        Explore the shops like you're walking the street!
      </p>

      {/* Walk the Street Mode */}
      <div className="w-full max-w-5xl overflow-x-auto whitespace-nowrap space-x-4 flex snap-x snap-mandatory pb-6">
        {shops.map((shop) => (
          <div
            key={shop.slug}
            className="snap-center min-w-[300px] bg-white rounded-2xl shadow-md p-6 mx-2 flex-shrink-0 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* 🎉 Event Ribbon */}
            {shop.event && (
              <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg shadow">
                {shop.event}
              </div>
            )}

            {/* ❤️ Favorite Icon */}
            <button
              onClick={() => toggleFavorite(shop.slug)}
              className="absolute top-4 right-4 text-pink-500 hover:text-pink-700 text-xl"
              title={favorites.includes(shop.slug) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorites.includes(shop.slug) ? '❤️' : '🤍'}
            </button>

            <h2 className="text-2xl font-semibold text-pink-700 mb-2">{shop.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{shop.parking}</p>
            <Link
              href={`/cities/${params.city}/${params.street}/shops/${shop.slug}`}
              className="inline-block mt-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              View Shop →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
