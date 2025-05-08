'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AddShop() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');
  const [loading, setLoading] = useState(false);

  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [streetSlug, setStreetSlug] = useState('');

  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [streets, setStreets] = useState<{ name: string; slug: string }[]>([]);

  const router = useRouter();

  // ✅ 1️⃣ Load countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('streets')
        .select('country')
        .neq('country', null);
  
      console.log('Fetched countries:', data); // ✅ leave this log for now
      if (error) console.error('Fetch error:', error);
  
      const uniqueCountries = Array.from(new Set(data.map((row) => row.country)));
      setCountries(uniqueCountries);
    };
  
    fetchCountries();
  }, []);

  // ✅ 2️⃣ Load provinces when country changes
  useEffect(() => {
    if (!country) {
      setProvinces([]);
      setProvince('');
      return;
    }

    const fetchProvinces = async () => {
      const { data, error } = await supabase
        .from('streets')
        .select('province')
        .eq('country', country)
        .neq('province', null);

      if (error) {
        console.error('Failed to load provinces:', error);
        return;
      }

      const uniqueProvinces = Array.from(new Set(data.map((row) => row.province)));
      setProvinces(uniqueProvinces);
    };

    fetchProvinces();
    setProvince('');
    setCities([]);
    setCity('');
    setStreets([]);
    setStreetSlug('');
  }, [country]);

  // ✅ 3️⃣ Load cities when province changes
  useEffect(() => {
    if (!province) {
      setCities([]);
      setCity('');
      return;
    }

    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('streets')
        .select('city')
        .eq('country', country)
        .eq('province', province)
        .neq('city', null);

      if (error) {
        console.error('Failed to load cities:', error);
        return;
      }

      const uniqueCities = Array.from(new Set(data.map((row) => row.city)));
      setCities(uniqueCities);
    };

    fetchCities();
    setCity('');
    setStreets([]);
    setStreetSlug('');
  }, [province, country]);

  // ✅ 4️⃣ Load streets when city changes
  useEffect(() => {
    if (!city) {
      setStreets([]);
      setStreetSlug('');
      return;
    }

    const fetchStreets = async () => {
      const { data, error } = await supabase
        .from('streets')
        .select('name, slug')
        .eq('country', country)
        .eq('province', province)
        .eq('city', city);

      if (error) {
        console.error('Failed to load streets:', error);
        return;
      }

      setStreets(data);
    };

    fetchStreets();
    setStreetSlug('');
  }, [city, province, country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !country || !province || !city || !streetSlug) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not logged in.');
      }
      const userId = userData.user.id;

      const { error: insertError } = await supabase.from('shops').insert([
        {
          name,
          slug,
          streetSlug,
          description,
          parking,
          owner_id: userId,
        },
      ]);

      if (insertError) throw insertError;

      alert('Shop added successfully!');
      router.push('/shop-owner/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">🏪 Add Your Shop</h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Shop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Slug (e.g., joes-coffee)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* ✅ Country Dropdown */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* ✅ Province Dropdown */}
          {country && (
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          {/* ✅ City Dropdown */}
          {province && (
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select City</option>
              {cities.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          )}

          {/* ✅ Street Dropdown */}
          {city && (
            <select
              value={streetSlug}
              onChange={(e) => setStreetSlug(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Street</option>
              {streets.map((st) => (
                <option key={st.slug} value={st.slug}>
                  {st.name}
                </option>
              ))}
            </select>
          )}

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Parking Info (optional)"
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition font-semibold"
          >
            {loading ? 'Saving...' : 'Save Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}
