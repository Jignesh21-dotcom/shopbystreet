'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type LiveCity = {
  country_slug: string;
  country_name: string;
  region_slug: string;
  region_name: string;
  city_slug: string;
  city_name: string;
  shop_count: number | string;
};

type CountryGroup = {
  countrySlug: string;
  countryName: string;
  cities: LiveCity[];
};

const normalizeSlug = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, '-');

const getCityHref = (city: LiveCity) => {
  const countrySlug = normalizeSlug(city.country_slug);
  const regionSlug = normalizeSlug(city.region_slug);
  const citySlug = normalizeSlug(city.city_slug);

  if (countrySlug === 'canada') {
    return `/cities/${encodeURIComponent(citySlug)}`;
  }

  return `/countries/${encodeURIComponent(countrySlug)}/${encodeURIComponent(
    regionSlug
  )}/${encodeURIComponent(citySlug)}`;
};

export default function LiveCitiesPage() {
  const [cities, setCities] = useState<LiveCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchCitiesWithShops = async () => {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase.rpc(
        'get_live_cities_with_shops'
      );

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching live cities:', error);
        setErrorMessage(
          'We could not load the live cities right now. Please try again shortly.'
        );
        setCities([]);
      } else {
        setCities((data || []) as LiveCity[]);
      }

      setLoading(false);
    };

    fetchCitiesWithShops();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedCities = useMemo<CountryGroup[]>(() => {
    const groups = new Map<string, CountryGroup>();

    cities.forEach((city) => {
      const countrySlug = normalizeSlug(city.country_slug);
      const existingGroup = groups.get(countrySlug);

      if (existingGroup) {
        existingGroup.cities.push(city);
        return;
      }

      groups.set(countrySlug, {
        countrySlug,
        countryName: city.country_name,
        cities: [city],
      });
    });

    const countryOrder: Record<string, number> = {
      canada: 0,
      india: 1,
    };

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        cities: [...group.cities].sort((a, b) =>
          a.city_name.localeCompare(b.city_name)
        ),
      }))
      .sort((a, b) => {
        const aOrder = countryOrder[a.countrySlug] ?? 99;
        const bOrder = countryOrder[b.countrySlug] ?? 99;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.countryName.localeCompare(b.countryName);
      });
  }, [cities]);

  const title = 'Explore Live Cities | LocalStreetShop';
  const description =
    'Explore cities in Canada and India where local shops are already listed on LocalStreetShop.';
  const url = 'https://www.localstreetshop.com/live-cities';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            ← Back
          </button>

          <section className="mb-10 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
              LocalStreetShop Global
            </p>

            <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
              🏙️ Explore Live Cities
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Browse cities where local shops are already listed, then explore
              their streets and businesses.
            </p>
          </section>

          <section className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:flex-row md:p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Want to help bring your city online?
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Join the LocalStreetShop Community Partner Program and help
                local businesses get discovered.
              </p>
            </div>

            <Link
              href="/community-partners"
              className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700"
            >
              Become a Founding Community Partner
            </Link>
          </section>

          {loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-gray-700">Loading live cities…</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && groupedCities.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                No live cities found
              </h2>
              <p className="mt-2 text-gray-600">
                Cities will appear here once they have approved shops.
              </p>
            </div>
          )}

          {!loading && !errorMessage && groupedCities.length > 0 && (
            <div className="space-y-12">
              {groupedCities.map((group) => (
                <section key={group.countrySlug}>
                  <div className="mb-5 flex flex-col justify-between gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                        Explore by country
                      </p>
                      <h2 className="mt-1 text-3xl font-extrabold text-gray-950">
                        {group.countryName}
                      </h2>
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                      {group.cities.length}{' '}
                      {group.cities.length === 1 ? 'live city' : 'live cities'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {group.cities.map((city) => {
                      const shopCount = Number(city.shop_count) || 0;

                      return (
                        <Link
                          key={`${group.countrySlug}-${city.region_slug}-${city.city_slug}`}
                          href={getCityHref(city)}
                          className="group block transform rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg"
                        >
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {city.region_name}
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-gray-900 transition group-hover:text-blue-700">
                            {city.city_name}
                          </h3>

                          <p className="mt-2 text-sm text-gray-600">
                            {shopCount.toLocaleString()} approved{' '}
                            {shopCount === 1 ? 'shop' : 'shops'} listed
                          </p>

                          <p className="mt-5 text-sm font-semibold text-blue-700">
                            Explore streets →
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}