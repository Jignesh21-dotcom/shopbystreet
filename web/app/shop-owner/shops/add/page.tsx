'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function AddShop() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [addressLabel, setAddressLabel] = useState(''); // ✅ New field
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase.from('countries').select('id, name').order('name');
      if (data) setCountries(data);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from('provinces')
        .select('id, name')
        .eq('country_id', selectedCountry)
        .order('name');
      setProvinces(data || []);
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedStreet('');
      setCities([]);
      setStreets([]);
    };
    fetchProvinces();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedProvince) return;
    const fetchCities = async () => {
      const { data } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', selectedProvince)
        .order('name');
      setCities(data || []);
      setSelectedCity('');
      setSelectedStreet('');
      setStreets([]);
    };
    fetchCities();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) return;
    const fetchStreets = async () => {
      const { data } = await supabase
        .from('streets')
        .select('id, name, slug')
        .eq('city_id', selectedCity)
        .order('name');
      setStreets(data || []);
      setSelectedStreet('');
    };
    fetchStreets();
  }, [selectedCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !addressLabel || !selectedStreet) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not logged in.');

      const { error } = await supabase.from('shops').insert([{
        name,
        slug,
        streetSlug: streets.find((s) => s.id === selectedStreet)?.slug,
        description: addressLabel,
        parking,
        owner_id: userData.user.id,
      }]);

      if (error) throw error;

      alert('Shop added successfully!');
      router.push('/shop-owner/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const title = 'Add Your Shop | Local Street Shop';
  const metaDescription = 'Shop owners can easily add their local business to Local Street Shop. Connect with nearby customers and grow your presence online.';
  const url = 'https://www.localstreetshop.com/shops/add';

  return (
    <>
      <SEO title={title} description={metaDescription} url={url} />

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
              className="p-3 rounded-lg border border-gray-300"
            />

            <input
              type="text"
              placeholder="Slug (e.g., joes-coffee)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300"
            />

            <input
              type="text"
              placeholder="Full Address (e.g., 123 Queen St E, Toronto)"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300"
            />

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {provinces.length > 0 && (
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300"
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {streets.length > 0 && (
              <select
                value={selectedStreet}
                onChange={(e) => setSelectedStreet(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300"
              >
                <option value="">Select Street</option>
                {streets.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="p-3 rounded-lg border border-gray-300"
            />

            <input
              type="text"
              placeholder="Parking Info (optional)"
              value={parking}
              onChange={(e) => setParking(e.target.value)}
              className="p-3 rounded-lg border border-gray-300"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Saving...' : 'Save Shop'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
