'use client';

import { useState } from 'react';
import emailjs from 'emailjs-com';
import provinces from '@/data/provinces.json';
import cities from '@/data/cities.json';

type FormState = {
  name: string;
  provinceSlug: string;
  citySlug: string;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function SubmitStreetClient() {
  const [form, setForm] = useState<FormState>({
    name: '',
    provinceSlug: '',
    citySlug: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filteredCities = cities.filter(
    (city) => city.provinceSlug === form.provinceSlug
  );

  const selectedProvince = provinces.find(
    (province) => province.slug === form.provinceSlug
  );

  const selectedCity = cities.find((city) => city.slug === form.citySlug);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'provinceSlug' ? { citySlug: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const newStreet = {
        name: form.name.trim(),
        slug: slugify(form.name),
        citySlug: form.citySlug,
        provinceSlug: form.provinceSlug,
        approved: false,
        submittedAt: new Date().toISOString(),
      };

      const pending = localStorage.getItem('pendingStreets');
      const list = pending ? JSON.parse(pending) : [];

      list.push(newStreet);
      localStorage.setItem('pendingStreets', JSON.stringify(list));

      await emailjs.send(
        'service_ra938k5',
        'template_p1vwnzp',
        {
          street_name: form.name.trim(),
          city: selectedCity?.name || form.citySlug,
          province: selectedProvince?.name || form.provinceSlug,
        },
        'ddd-F-k7CZdBPSiOm'
      );

      setSubmitted(true);
      setForm({
        name: '',
        provinceSlug: '',
        citySlug: '',
      });
    } catch (err) {
      console.error('Street submission failed:', err);
      setError('Unable to submit this street right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12 text-gray-900">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
            Help LocalStreetShop Grow
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-950">
            Suggest a Street
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Tell us which street should be added next. Your suggestion helps us
            expand local business discovery across Canadian cities.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          {submitted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-900">
                Street Submitted
              </h2>

              <p className="mt-3 text-gray-600">
                Thank you for helping LocalStreetShop grow. We&apos;ll review
                your suggestion as we continue expanding.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Suggest Another Street
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Street Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Example: King Street West"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="provinceSlug"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Province
                </label>

                <select
                  id="provinceSlug"
                  name="provinceSlug"
                  value={form.provinceSlug}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a province</option>
                  {provinces.map((province) => (
                    <option key={province.slug} value={province.slug}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="citySlug"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  City
                </label>

                <select
                  id="citySlug"
                  name="citySlug"
                  value={form.citySlug}
                  onChange={handleChange}
                  required
                  disabled={!form.provinceSlug}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {form.provinceSlug
                      ? 'Select a city'
                      : 'Select a province first'}
                  </option>

                  {filteredCities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Street'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}