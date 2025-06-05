'use client';

import { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import { supabase } from '@/lib/supabaseClient';

export default function SubmitShopForm() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    provinceId: '',
    cityId: '',
    streetId: '',
    parking: 'Paid Parking Nearby',
    wantsProducts: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  // Fetch provinces on mount
  useEffect(() => {
    supabase.from('provinces').select('id, name').then(({ data }) => {
      setProvinces(data || []);
    });
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (!form.provinceId) {
      setCities([]);
      setForm((prev) => ({ ...prev, cityId: '', streetId: '' }));
      return;
    }
    supabase
      .from('cities')
      .select('id, name')
      .eq('province_id', form.provinceId)
      .then(({ data }) => {
        setCities(data || []);
        setForm((prev) => ({ ...prev, cityId: '', streetId: '' }));
      });
  }, [form.provinceId]);

  // Fetch streets when city changes
  useEffect(() => {
    if (!form.cityId) {
      setStreets([]);
      setForm((prev) => ({ ...prev, streetId: '' }));
      return;
    }
    supabase
      .from('streets')
      .select('id, name')
      .eq('city_id', form.cityId)
      .then(({ data }) => {
        setStreets(data || []);
        setForm((prev) => ({ ...prev, streetId: '' }));
      });
  }, [form.cityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'provinceId' ? { cityId: '', streetId: '' } : {}),
      ...(name === 'cityId' ? { streetId: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newShop = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      address: form.address,
      street_id: form.streetId, // Use normalized street_id
      parking: form.parking,
      wantsProducts: form.wantsProducts,
      paid: false,
    };

    try {
      const res = await fetch('/api/submit-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShop),
      });

      if (res.ok) {
        // Fetch selected names for email
        const selectedProvince = provinces.find((p) => p.id === form.provinceId);
        const selectedCity = cities.find((c) => c.id === form.cityId);
        const selectedStreet = streets.find((s) => s.id === form.streetId);

        emailjs
          .send(
            'service_ra938k5',
            'template_p1vwnzp',
            {
              shop_name: form.name,
              address: form.address,
              street: selectedStreet?.name || '',
              city: selectedCity?.name || '',
              province: selectedProvince?.name || '',
              parking: form.parking,
              wants_products: form.wantsProducts ? 'Yes - wants to add products ($49)' : 'No',
            },
            'ddd-F-k7CZdBPSiOm'
          )
          .then(() => {
            console.log('✅ Email sent');
          })
          .catch((err) => {
            console.error('❌ Email error:', err);
          });

        setSubmitted(true);
      } else {
        alert('Error submitting shop.');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('Error submitting shop.');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Submit Your Shop</h1>
      {submitted ? (
        <p className="text-green-600 font-medium">
          ✅ Shop submitted successfully! We’ll contact you if you selected product options.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl bg-white p-6 rounded-xl shadow space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Shop Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Full Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 123 Queen St E, Toronto, ON"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Province</label>
            <select
              name="provinceId"
              value={form.provinceId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select Province --</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">City</label>
            <select
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              disabled={!form.provinceId}
            >
              <option value="">-- Select City --</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Street</label>
            <select
              name="streetId"
              value={form.streetId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              disabled={!form.cityId}
            >
              <option value="">-- Select Street --</option>
              {streets.map((street) => (
                <option key={street.id} value={street.id}>
                  {street.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Parking</label>
            <select
              name="parking"
              value={form.parking}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option>Paid Parking Nearby</option>
              <option>Street Parking Available</option>
              <option>Free Parking Nearby</option>
              <option>Free Parking Available</option>
            </select>
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="wantsProducts"
                checked={form.wantsProducts}
                onChange={handleChange}
                className="mr-2"
              />
              I want to add products now (requires a one-time fee of $49)
            </label>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Submit Shop
          </button>
        </form>
      )}
    </main>
  );
}