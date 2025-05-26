'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LiveCitiesPage() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCitiesWithShops = async () => {
      const { data, error } = await supabase.rpc('get_live_cities_with_shops');
      if (error) console.error('Error fetching cities:', error);
      else setCities(data);
    };

    fetchCitiesWithShops();
  }, []);

  return (
    <main className="min-h-screen bg-white py-12 px-4 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">🏙️ Cities with Live Shops</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="block bg-blue-100 hover:bg-blue-200 rounded-xl p-6 shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{city.name}</h2>
              <p className="text-sm text-gray-700">{city.shop_count} shops</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
