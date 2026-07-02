'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function AddShopClient() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const { data } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');

      setCountries(data || []);
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
      setCities([]);
      setStreets([]);
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedStreet('');
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
      setStreets([]);
      setSelectedCity('');
      setSelectedStreet('');
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

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !slug.trim() || !addressLabel.trim() || !selectedStreet) {
      setError('Please fill in shop name, slug, address, and street.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        throw new Error('Please log in before adding a shop.');
      }

      const { error } = await supabase.from('shops').insert([
        {
          name: name.trim(),
          slug: slug.trim(),
          street_id: selectedStreet,
          address: addressLabel.trim(),
          description: description.trim(),
          parking: parking.trim(),
          owner_id: userData.user.id,
          approved: false,
        },
      ]);

      if (error) throw error;

      router.push('/shop-owner/dashboard');
    } catch (err: any) {
      console.error('Add shop error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/shop-owner/dashboard"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Dashboard
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Setup
          </p>

          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Add a new shop
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            Add your business to LocalStreetShop. New shop submissions may need
            review before appearing publicly.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. Joe's Coffee"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Shop URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  placeholder="joes-coffee"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Address
              </label>
              <input
                type="text"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                required
                placeholder="e.g. 123 Queen St E, Toronto"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {provinces.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Province
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {cities.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {streets.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Street
                  </label>
                  <select
                    value={selectedStreet}
                    onChange={(e) => setSelectedStreet(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select Street</option>
                    {streets.map((street) => (
                      <option key={street.id} value={street.id}>
                        {street.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Description optional
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell customers what your shop offers..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Parking Info optional
              </label>
              <input
                type="text"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                placeholder="Street parking, plaza parking, paid parking nearby..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-800">
                After submission, your shop may require approval before it is
                shown publicly. If your business is already listed, use the
                Claim Shop page instead.
              </p>

              <Link
                href="/shop-owner/claim"
                className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
              >
                Claim an existing shop →
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? 'Saving Shop...' : 'Submit Shop'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}