'use client'; // ✅ Makes this a client component

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // ✅ uses public anon key

type City = {
  name: string;
  slug: string;
};

export default function LiveCitiesLink() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase.rpc('get_live_cities');
      console.log('Live cities data:', data); // ✅ Add this line
      if (error) {
        console.error('Error loading cities:', error.message);
        return;
      }

      setCities(data || []);
    };

    fetchCities();
  }, []);

  return (
    <div>
      <p className="font-semibold">✅ Cities with Live Shops:</p>
      <ul className="list-disc ml-6 mb-4">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/cities/${city.slug}`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              {city.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
