'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ExpansionNotice from '@/app/components/ExpansionNotice';
import { getCitiesByProvinceSlug } from '@/lib/data';

const provinceBackgrounds: Record<string, string> = {
  ontario: 'https://images.pexels.com/photos/29290069/pexels-photo-29290069.jpeg',
  quebec: 'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg',
  'british-columbia': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
  alberta: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
  manitoba: 'https://images.pexels.com/photos/356844/pexels-photo-356844.jpeg',
  saskatchewan: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
  'nova-scotia': 'https://images.pexels.com/photos/417169/pexels-photo-417169.jpeg',
  'new-brunswick': 'https://images.pexels.com/photos/417171/pexels-photo-417171.jpeg',
  'newfoundland-and-labrador': 'https://images.pexels.com/photos/417172/pexels-photo-417172.jpeg',
  'prince-edward-island': 'https://images.pexels.com/photos/417168/pexels-photo-417168.jpeg',
  'northwest-territories': 'https://images.pexels.com/photos/417174/pexels-photo-417174.jpeg',
  nunavut: 'https://images.pexels.com/photos/417175/pexels-photo-417175.jpeg',
  yukon: 'https://images.pexels.com/photos/417176/pexels-photo-417176.jpeg',
};

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
};

export default function ProvinceClient({ province }: ProvinceClientProps) {
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
          setError('No cities found or an error occurred.');
        } else {
          setCities(data);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      }

      setLoading(false);
    };

    fetchCities();
  }, [province]);

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

  const backgroundImage =
    provinceBackgrounds[province.toLowerCase()] ||
    'https://images.pexels.com/photos/1029613/pexels-photo-1029613.jpeg'; // fallback

  const provinceFlag = provinceFlags[province.toLowerCase()] || '/flags/ontario.png';

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center flex flex-col items-center relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <Link
          href="/countries/canada"
          className="self-start mb-6 text-blue-200 hover:text-white hover:underline"
        >
          ← Back to Canada
        </Link>

        <ExpansionNotice />

        <h1 className="text-4xl font-bold text-white mb-6 capitalize text-center flex items-center gap-4">
          <Image
            src={provinceFlag}
            alt={`${province} flag`}
            width={48}
            height={32}
            className="rounded border shadow"
          />
          {decodeURIComponent(province).replace(/-/g, ' ')}
        </h1>

        <input
          type="text"
          placeholder="Search for a city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 p-3 w-full max-w-md rounded-lg border border-blue-300 shadow focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition"
        />

        {loading ? (
          <p className="text-white text-lg">Loading cities...</p>
        ) : error ? (
          <div className="text-center mt-10 text-white text-lg">
            😕 {error}
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {filteredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 hover:border-blue-400 border border-transparent transform transition-all duration-300 text-center flex items-center justify-center"
              >
                <h2 className="text-2xl font-semibold text-blue-700 group-hover:text-blue-900 flex items-center justify-center">
                  🏙️ {highlightText(city.name)}
                </h2>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10 text-white text-lg">
            😕 No cities found matching "<span className="font-semibold">{search}</span>"
          </div>
        )}
      </div>
    </div>
  );
}
