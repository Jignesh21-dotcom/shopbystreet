'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// ✅ Define props locally
type Props = {
  params: Promise<{
    city: string;
  }>;
};

export default async function CityPage({ params }: Props) {
  const resolvedParams = await params; // Resolve the promise if params is asynchronous
  const { city } = resolvedParams;

  const [streets, setStreets] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStreets = async () => {
      setLoading(true);
      setError(null);

      // 1️⃣ Fetch the city by slug to get the city_id
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('slug', city)
        .single();

      console.log('🔎 cityData:', cityData);

      if (cityError || !cityData) {
        console.error('Error fetching city:', cityError);
        setError('City not found.');
        setLoading(false);
        return;
      }

      // 2️⃣ Get total count of streets for pagination
      const { count, error: countError } = await supabase
        .from('streets')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', cityData.id);

      if (countError || count === null) {
        console.error('Error fetching count:', countError);
        setError('Failed to load streets.');
        setLoading(false);
        return;
      }

      console.log(`🟢 Total streets count for ${cityData.name}:`, count);

      const CHUNK_SIZE = 1000;
      const promises = [];

      // 3️⃣ Fetch all streets in chunks
      for (let start = 0; start < count; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, count - 1);
        promises.push(
          supabase
            .from('streets')
            .select('name, slug')
            .eq('city_id', cityData.id)
            .order('name', { ascending: true })
            .range(start, end)
        );
      }

      const results = await Promise.all(promises);
      const allData = results.flatMap((r) => r.data ?? []);

      console.log('✅ All streets fetched:', allData.length, allData);

      setStreets(allData);
      setLoading(false);
    };

    fetchStreets();
  }, [city]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading streets...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center">
      {/* Back button */}
      <Link
        href={`/provinces/ontario`} // (optional: dynamic if needed)
        className="self-start mb-6 text-blue-700 hover:text-blue-900 hover:underline"
      >
        ← Back to Ontario
      </Link>

      <h1 className="text-4xl font-bold text-blue-800 mb-6 capitalize">
        🏙️ Streets in {city.charAt(0).toUpperCase() + city.slice(1)}
      </h1>

      <input
        type="text"
        placeholder="Search for a street..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filteredStreets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredStreets.map((street) => (
            <Link
              key={street.slug}
              href={`/cities/${city}/${street.slug}`}
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