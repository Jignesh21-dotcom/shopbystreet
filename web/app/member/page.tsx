'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function MemberPage() {
  const [user, setUser] = useState<any>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedShop, setSelectedShop] = useState('');

  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');

  const title = 'Account | LocalStreetShop';
  const description =
    'Sign in to your LocalStreetShop account to review local shops, explore businesses, and access future community features.';
  const url = 'https://www.localstreetshop.com/member';

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching countries:', error);
      } else {
        setCountries(data || []);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchProvinces = async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .eq('country_id', selectedCountry)
        .order('name');

      if (error) {
        console.error('Error fetching provinces:', error);
      } else {
        setProvinces(data || []);
        setCities([]);
        setStreets([]);
        setShops([]);
        setSelectedProvince('');
        setSelectedCity('');
        setSelectedStreet('');
        setSelectedShop('');
      }
    };

    fetchProvinces();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', selectedProvince)
        .order('name');

      if (error) {
        console.error('Error fetching cities:', error);
      } else {
        setCities(data || []);
        setStreets([]);
        setShops([]);
        setSelectedCity('');
        setSelectedStreet('');
        setSelectedShop('');
      }
    };

    fetchCities();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchStreets = async () => {
      const { count, error: countError } = await supabase
        .from('streets')
        .select('id', { count: 'exact', head: true })
        .eq('city_id', selectedCity);

      if (countError || count === null) {
        console.error('Error fetching street count:', countError);
        return;
      }

      const CHUNK_SIZE = 1000;
      const promises = [];

      for (let start = 0; start < count; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, count - 1);

        promises.push(
          supabase
            .from('streets')
            .select('id, name')
            .eq('city_id', selectedCity)
            .order('name', { ascending: true })
            .range(start, end)
        );
      }

      const results = await Promise.all(promises);
      const allData = results.flatMap((r) => r.data ?? []);

      setStreets(allData);
      setShops([]);
      setSelectedStreet('');
      setSelectedShop('');
    };

    fetchStreets();
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedStreet) return;

    const fetchShops = async () => {
      const { count, error: countError } = await supabase
        .from('shops')
        .select('id', { count: 'exact', head: true })
        .eq('street_id', selectedStreet);

      if (countError || count === null) {
        console.error('Error fetching shop count:', countError);
        return;
      }

      const CHUNK_SIZE = 1000;
      const promises = [];

      for (let start = 0; start < count; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, count - 1);

        promises.push(
          supabase
            .from('shops')
            .select('id, name')
            .eq('street_id', selectedStreet)
            .order('name', { ascending: true })
            .range(start, end)
        );
      }

      const results = await Promise.all(promises);
      const allData = results.flatMap((r) => r.data ?? []);

      setShops(allData);
      setSelectedShop('');
    };

    fetchShops();
  }, [selectedStreet]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage('Please log in before submitting a review.');
      return;
    }

    if (!selectedShop || !review.trim()) {
      setMessage('Please select a shop and write your review.');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        shop_id: selectedShop,
        user_id: user.id,
        review: review.trim(),
      },
    ]);

    if (error) {
      console.error('Error submitting review:', error);
      setMessage('Something went wrong. Please try again.');
    } else {
      setMessage('Review submitted! ✅');
      setReview('');
      setSelectedShop('');
    }
  };

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:py-10">
        <div className="max-w-4xl mx-auto">
          {user && user.user_metadata?.isShopOwner ? (
            <div className="rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm sm:p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-3">
                Shop Owner Account Detected
              </h1>

              <p className="text-gray-600 mb-6">
                This page is for shopper accounts. Please continue to the Shop
                Owner area to manage your business.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/shop-owner"
                  className="inline-block w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 sm:w-auto"
                >
                  Go to Shop Owner Area
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-block w-full rounded-full border border-red-200 bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : !user ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8 md:p-10">
              <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
                LocalStreetShop Account
              </p>

              <h1 className="mb-3 text-2xl font-extrabold sm:mb-4 sm:text-3xl md:text-4xl">
                Your LocalStreetShop Account
              </h1>

              <p className="mx-auto mb-7 max-w-2xl text-gray-600 sm:mb-8">
                Sign in or create an account to review local shops, explore
                businesses, and access future LocalStreetShop community features.
              </p>

              <div className="mb-7 grid gap-3 text-left sm:mb-8 md:grid-cols-3 md:gap-4">
                <div className="rounded-2xl bg-blue-50 p-4 sm:p-5">
                  <h2 className="font-bold text-blue-800 mb-2">
                    🧭 Explore Shops
                  </h2>
                  <p className="text-sm text-gray-700">
                    Browse local businesses by city, street, and address.
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 sm:p-5">
                  <h2 className="font-bold text-green-800 mb-2">
                    📝 Leave Reviews
                  </h2>
                  <p className="text-sm text-gray-700">
                    Share your experience and help others discover great local
                    shops.
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-4 sm:p-5">
                  <h2 className="font-bold text-purple-800 mb-2">
                    🔥 Access Deals
                  </h2>
                  <p className="text-sm text-gray-700">
                    Discover local deals and future shopper features as they
                    become available.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/login"
                  className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 sm:w-auto"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
                >
                  Create Account
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 md:p-10">
              <div className="mb-8 text-center">
                <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
                  Welcome Back
                </p>

                <h1 className="text-3xl font-extrabold mb-3">
                  Welcome back 👋
                </h1>

                <p className="text-gray-600">
                  Signed in as{' '}
                  <span className="font-semibold text-gray-900">
                    {user.email}
                  </span>
                </p>

                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/deals"
                    className="w-full rounded-full bg-blue-50 px-5 py-2.5 font-semibold text-blue-700 transition hover:bg-blue-100 sm:w-auto"
                  >
                    View Deals
                  </Link>

                  <Link
                    href="/live-cities"
                    className="w-full rounded-full bg-blue-50 px-5 py-2.5 font-semibold text-blue-700 transition hover:bg-blue-100 sm:w-auto"
                  >
                    Browse Cities
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full bg-red-50 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-100 sm:w-auto"
                  >
                    Logout
                  </button>
                </div>

                <p className="text-gray-600 mt-6">
                  Leave a quick review for your favorite local shop.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-1 font-semibold">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-white"
                  >
                    <option value="">Choose a country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {provinces.length > 0 && (
                  <div>
                    <label className="block mb-1 font-semibold">Province</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-white"
                    >
                      <option value="">Choose a province</option>
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
                    <label className="block mb-1 font-semibold">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-white"
                    >
                      <option value="">Choose a city</option>
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
                    <label className="block mb-1 font-semibold">Street</label>
                    <select
                      value={selectedStreet}
                      onChange={(e) => setSelectedStreet(e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-white"
                    >
                      <option value="">Choose a street</option>
                      {streets.map((street) => (
                        <option key={street.id} value={street.id}>
                          {street.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {shops.length > 0 && (
                  <div>
                    <label className="block mb-1 font-semibold">Shop</label>
                    <select
                      value={selectedShop}
                      onChange={(e) => setSelectedShop(e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-white"
                    >
                      <option value="">Choose a shop</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name || '(Unnamed shop)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedShop && (
                  <>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Your Review
                      </label>
                      <input
                        type="text"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Amazing shop, loved it!"
                        className="w-full border border-gray-200 px-4 py-3 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-700 font-semibold shadow transition"
                    >
                      Submit Review
                    </button>
                  </>
                )}

                {message && (
                  <p className="mt-2 text-center font-semibold text-green-600">
                    {message}
                  </p>
                )}
              </form>
            </section>
          )}
        </div>
      </main>
    </>
  );
}