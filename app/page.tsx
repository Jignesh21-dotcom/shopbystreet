'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [cities, setCities] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const comingSoonCities = ['Montreal', 'Vancouver', 'Ottawa', '...and more!'];

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
      .from('active_cities')
        .select('name, slug')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } else {
        setCities(data ?? []);
      }
      setLoading(false);
    };

    fetchCities();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center p-10 text-center">
      {/* Image or banner */}
      <img
        src="https://images.pexels.com/photos/29290069/pexels-photo-29290069.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        alt="Street Shopping"
        className="w-full max-w-4xl rounded-xl shadow-md mb-10"
      />

      {/* Heading */}
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        🛍️ Welcome to Shop Street
      </h1>

      {/* Description */}
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Discover authentic local businesses and explore real shops across Canadian streets. Support small, shop local, and experience Canada city by city.
      </p>

      {/* Explore button */}
      <Link
        href="/countries/canada"
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition mb-12"
      >
        🌎 Explore Canada
      </Link>

      {/* 🚧 Coverage Notice */}
      <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-lg max-w-2xl shadow">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">🚧 We’re Expanding!</h2>
        <p className="text-gray-700 mb-4">
          ShopByStreet is just getting started! Right now, we’re live with shops in{' '}
          {loading ? (
            <span className="italic text-gray-500">Loading cities...</span>
          ) : cities.length === 0 ? (
            <span className="italic text-gray-500">No cities found.</span>
          ) : (
            cities.map((city, index) => (
              <span key={city.slug}>
                <Link
                  href={`/cities/${city.slug}`}
                  className="text-blue-500 underline hover:text-blue-700"
                >
                  {city.name}
                </Link>
                {index < cities.length - 1 ? ', ' : ''}
              </span>
            ))
          )}
          , and we’re working hard to add more cities and provinces across Canada—and soon, worldwide.
        </p>

        <div className="text-left text-gray-800">
          <p className="font-semibold">✅ Current Available City:</p>
          <ul className="list-disc ml-6 mb-4">
            {loading ? (
              <li className="italic text-gray-500">Loading cities...</li>
            ) : cities.length === 0 ? (
              <li className="italic text-gray-500">No cities found.</li>
            ) : (
              cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    {city.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
          <p className="font-semibold">🚀 Coming Soon:</p>
          <ul className="list-disc ml-6">
            {comingSoonCities.map((city, index) => (
              <li key={index}>{city}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
