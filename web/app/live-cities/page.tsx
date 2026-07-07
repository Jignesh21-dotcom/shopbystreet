'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type City = {
  slug: string;
  name: string;
  shop_count: number;
};

export default function LiveCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCitiesWithShops = async () => {
      const { data, error } = await supabase.rpc('get_live_cities_with_shops');

      if (error) {
        console.error('Error fetching cities:', error);
      } else {
        setCities(data || []);
      }
    };

    fetchCitiesWithShops();
  }, []);

  const title = 'Explore Live Cities | LocalStreetShop';
  const description =
    'Browse Canadian cities where local shops are already listed on LocalStreetShop.';
  const url = 'https://www.localstreetshop.com/live-cities';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gray-50 py-12 px-4 text-gray-900">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back
          </button>

          <section className="text-center mb-10">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop Canada
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              🏙️ Explore Live Cities
            </h1>

            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Browse Canadian cities where local shops are already listed on
              LocalStreetShop.
            </p>
          </section>

          <section className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Want to help bring your city online?
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Join the LocalStreetShop Community Partner Program and help local
                businesses get discovered.
              </p>
            </div>

            <Link
              href="/community-partners"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full text-sm font-semibold shadow transition"
            >
              Become a Founding Community Partner
            </Link>
          </section>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${encodeURIComponent(city.slug)}`}
                className="group block bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                  {city.name}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  {city.shop_count.toLocaleString()} shops listed
                </p>

                <p className="text-blue-700 font-semibold text-sm mt-5">
                  Explore streets →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}