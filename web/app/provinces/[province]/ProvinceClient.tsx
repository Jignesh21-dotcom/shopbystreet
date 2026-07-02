'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ExpansionNotice from '@/app/components/ExpansionNotice';
import { getCitiesByProvinceSlug } from '@/lib/data';

const provinceFlags: Record<string, string> = {
  ontario: '/flags/ontario.png',
  quebec: '/flags/quebec.png',
  'british-columbia': '/flags/british-columbia.png',
  alberta: '/flags/alberta.png',
  manitoba: '/flags/manitoba.png',
  saskatchewan: '/flags/saskatchewan.png',
  'nova-scotia': '/flags/nova-scotia.png',
  'new-brunswick': '/flags/new-brunswick.png',
  'newfoundland-and-labrador': '/flags/newfoundland-and-labrador.png',
  'prince-edward-island': '/flags/prince-edward-island.png',
  'northwest-territories': '/flags/northwest-territories.png',
  nunavut: '/flags/nunavut.png',
  yukon: '/flags/yukon.png',
};

type ProvinceClientProps = {
  province: string;
  provinceName: string;
};

export default function ProvinceClient({
  province,
  provinceName,
}: ProvinceClientProps) {
  const [cities, setCities] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCitiesByProvinceSlug(province);

        if (!data || data.length === 0) {
          setCities([]);
          setError('No cities found yet.');
        } else {
          setCities(data);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('An unexpected error occurred while loading cities.');
      }

      setLoading(false);
    };

    fetchCities();
  }, [province]);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const provinceFlag =
    provinceFlags[province.toLowerCase()] || '/flags/ontario.png';

  const highlightText = (name: string) => {
    if (!search.trim()) return name;

    const parts = name.split(new RegExp(`(${search})`, 'gi'));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="rounded bg-yellow-200 px-1">
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
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/countries/canada"
          className="mb-6 inline-flex items-center text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          ← Back to Canada
        </Link>

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
                LocalStreetShop Province Directory
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Explore {provinceName}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
                Browse cities across {provinceName} and discover local shops,
                restaurants, services, cafés, and businesses street by street.
              </p>
            </div>

            <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-3xl bg-white/15 p-4">
              <Image
                src={provinceFlag}
                alt={`${provinceName} flag`}
                width={72}
                height={48}
                className="rounded border border-white/30 object-contain shadow-sm"
              />
            </div>
          </div>
        </section>

        <div className="mt-6">
          <ExpansionNotice />
        </div>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                Cities
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                Choose a city to start exploring
              </h2>

              <p className="mt-2 text-slate-600">
                Find local businesses by city, street, address, and shop.
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {cities.length} {cities.length === 1 ? 'city' : 'cities'} available
            </p>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Search cities in {provinceName}
            </label>

            <input
              type="text"
              placeholder="Search for a city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-600">Loading cities...</p>
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Cities coming soon
              </h2>
              <p className="mt-2 text-slate-600">{error}</p>
            </div>
          ) : filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${encodeURIComponent(city.slug)}`}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                    City
                  </p>

                  <h3 className="mt-3 text-2xl font-extrabold text-slate-950 transition group-hover:text-blue-700">
                    {highlightText(city.name)}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Explore streets, shops, restaurants, services, and local
                    businesses in {city.name}.
                  </p>

                  <p className="mt-5 font-bold text-blue-700">
                    Explore City →
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                No cities found
              </h2>

              <p className="mt-2 text-slate-600">
                No cities match “{search}” in {provinceName}. Try a different
                search.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}