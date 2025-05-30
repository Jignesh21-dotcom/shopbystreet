'use client';

import { useState } from 'react';
import emailjs from 'emailjs-com';
import provinces from '@/data/provinces.json';
import cities from '@/data/cities.json';
import SEO from '@/app/components/SEO';

export default function SubmitStreetPage() {
  const [form, setForm] = useState({
    name: '',
    provinceSlug: '',
    citySlug: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const filteredCities = cities.filter(
    (c) => c.provinceSlug === form.provinceSlug
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'provinceSlug' ? { citySlug: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newStreet = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      citySlug: form.citySlug,
      provinceSlug: form.provinceSlug,
      approved: false
    };

    const pending = localStorage.getItem('pendingStreets');
    const list = pending ? JSON.parse(pending) : [];
    list.push(newStreet);
    localStorage.setItem('pendingStreets', JSON.stringify(list));

    emailjs.send('service_ra938k5', 'template_p1vwnzp', {
      street_name: form.name,
      city: form.citySlug,
      province: form.provinceSlug
    }, 'ddd-F-k7CZdBPSiOm');

    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Suggest a New Street | Local Street Shop"
        description="Help us expand! Suggest a new street for your city and get your local shops featured."
        url="https://www.localstreetshop.com/submit-street"
      />

      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">🚧 Suggest a New Street</h1>

        {submitted ? (
          <p className="text-green-600 font-medium">✅ Street submitted for review! Thank you.</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl bg-white p-6 rounded-xl shadow space-y-4 w-full">
            <div>
              <label className="block mb-1 font-medium">Street Name</label>
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
              <label className="block mb-1 font-medium">Province</label>
              <select
                name="provinceSlug"
                value={form.provinceSlug}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Select Province --</option>
                {provinces.map((prov) => (
                  <option key={prov.slug} value={prov.slug}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">City</label>
              <select
                name="citySlug"
                value={form.citySlug}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
                disabled={!form.provinceSlug}
              >
                <option value="">-- Select City --</option>
                {filteredCities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Submit Street
            </button>
          </form>
        )}
      </main>
    </>
  );
}
