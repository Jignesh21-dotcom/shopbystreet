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

  const title = 'Member Area | Review Local Shops & Earn Perks';
  const description = 'Browse shops, leave reviews, and unlock local perks by joining the Local Street Shop member community.';
  const url = 'https://www.localstreetshop.com/member';

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching countries:', error);
      } else {
        setCountries(data);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const fetchProvinces = async () => {
        const { data, error } = await supabase
          .from('provinces')
          .select('id, name')
          .eq('country_id', selectedCountry)
          .order('name');

        if (error) {
          console.error('Error fetching provinces:', error);
        } else {
          setProvinces(data);
          setCities([]); setStreets([]); setShops([]);
          setSelectedProvince(''); setSelectedCity(''); setSelectedStreet(''); setSelectedShop('');
        }
      };
      fetchProvinces();
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .eq('province_id', selectedProvince)
          .order('name');

        if (error) {
          console.error('Error fetching cities:', error);
        } else {
          setCities(data);
          setStreets([]); setShops([]);
          setSelectedCity(''); setSelectedStreet(''); setSelectedShop('');
        }
      };
      fetchCities();
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      const fetchStreets = async () => {
        const { count, error: countError } = await supabase
          .from('streets')
          .select('*', { count: 'exact', head: true })
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
        setShops([]); setSelectedStreet(''); setSelectedShop('');
      };
      fetchStreets();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedStreet) {
      const fetchShops = async () => {
        const { count, error: countError } = await supabase
          .from('shops')
          .select('*', { count: 'exact', head: true })
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
        setShops(allData); setSelectedShop('');
      };
      fetchShops();
    }
  }, [selectedStreet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop || !review) {
      setMessage('Please select a shop and write your review.');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        shop_id: selectedShop,
        user_id: user.id,
        review: review,
      },
    ]);

    if (error) {
      console.error('Error submitting review:', error);
      setMessage('Something went wrong. Please try again.');
    } else {
      setMessage('Review submitted! ✅');
      setReview(''); setSelectedShop('');
    }
  };

  return (
    <>
      <SEO title={title} description={description} url={url} />

      {user && user.user_metadata?.isShopOwner ? (
        <div className="max-w-2xl mx-auto mt-20 p-6 text-center border rounded-lg shadow text-red-600">
          🛑 Access Denied: This page is for members only.
          <p className="mt-4">
            Please <Link href="/shop-owner" className="text-blue-600 underline">go to the Shop Owner area</Link>.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow">
          {!user ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Not a member yet?</h2>
              <p className="mb-4">Sign up or log in to unlock exclusive perks:</p>
              <ul className="list-disc text-left mb-4 mx-auto max-w-sm">
                <li>✅ Browse and buy products from local shops</li>
                <li>📝 Leave reviews and share your experiences</li>
                <li>🎯 Earn points & rewards (coming soon!)</li>
                <li>🎉 Early access to special deals</li>
              </ul>
              <div className="flex justify-center gap-4">
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Log In
                </Link>
                <Link href="/shop-owner-signup" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Welcome back, {user.email} 👋</h2>
              <p className="mb-6 text-gray-600">Leave a quick review for your favorite shop below:</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Country</label>
                  <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full border px-3 py-2 rounded">
                    <option value="">-- Choose a country --</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                    ))}
                  </select>
                </div>

                {provinces.length > 0 && (
                  <div>
                    <label className="block mb-1 font-medium">Province</label>
                    <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full border px-3 py-2 rounded">
                      <option value="">-- Choose a province --</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {cities.length > 0 && (
                  <div>
                    <label className="block mb-1 font-medium">City</label>
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border px-3 py-2 rounded">
                      <option value="">-- Choose a city --</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {streets.length > 0 && (
                  <div>
                    <label className="block mb-1 font-medium">Street</label>
                    <select value={selectedStreet} onChange={(e) => setSelectedStreet(e.target.value)} className="w-full border px-3 py-2 rounded">
                      <option value="">-- Choose a street --</option>
                      {streets.map((street) => (
                        <option key={street.id} value={street.id}>{street.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {shops.length > 0 && (
                  <div>
                    <label className="block mb-1 font-medium">Shop</label>
                    <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900">
                      <option value="">-- Choose a shop --</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name || '(Unnamed shop)'}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedShop && (
                  <>
                    <div>
                      <label className="block mb-1 font-medium">Your Review</label>
                      <input
                        type="text"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Amazing shop, loved it!"
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Submit Review
                    </button>
                  </>
                )}

                {message && <p className="mt-2 text-center text-green-600">{message}</p>}
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
