'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function HomeBusinessesPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const { error } = await supabase.from('home_businesses').insert([
      {
        name: formData.get('name'),
        city: formData.get('city'),
        description: formData.get('description'),
        website: formData.get('website'),
      },
    ]);

    if (error) {
      console.error('Submission failed:', error.message);
      alert('❌ Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      form.reset();
    }
  };

  const title = 'Home & Online Businesses | LocalStreetShop';
  const description =
    'Submit your home-based or online business to LocalStreetShop and help local entrepreneurs get discovered across Canada.';
  const url = 'https://www.localstreetshop.com/home-businesses';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-5xl mx-auto">
          <section className="text-center mb-10">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              LocalStreetShop for Home Businesses
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              🏠 Local Home & Online Businesses
            </h1>

            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Not every great business has a storefront. LocalStreetShop helps
              home-based entrepreneurs, online businesses, side hustlers, and
              local makers get discovered.
            </p>
          </section>

          <section className="grid gap-5 md:grid-cols-3 mb-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-blue-800 mb-2">🏡 Work From Home</h2>
              <p className="text-sm text-gray-700">
                Share your local home-based business with people in your city.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-green-800 mb-2">🧵 Local Makers</h2>
              <p className="text-sm text-gray-700">
                Promote handmade products, creative services, and community
                businesses.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-purple-800 mb-2">💻 Online First</h2>
              <p className="text-sm text-gray-700">
                Let customers discover your online business through
                LocalStreetShop.
              </p>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Add Your Home Business
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Submit your business for review. Approved listings may be shown
                on LocalStreetShop.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block font-semibold mb-1">
                    Business Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    name="city"
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Website / Social Media
                  </label>
                  <input
                    name="website"
                    type="text"
                    placeholder="Instagram, Facebook, website, or online store"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition font-semibold shadow"
                >
                  Submit My Business
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  ✅ Thank you!
                </h3>
                <p className="text-gray-700">
                  We&apos;ll review your submission and add your business
                  shortly if approved.
                </p>
              </div>
            )}
          </section>

          <section className="mt-12 bg-blue-700 text-white rounded-2xl p-6 md:p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-3">
              Featured Home Businesses Coming Soon
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Approved home-based and online businesses will be listed here in
              the future, grouped by city, category, or business type.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}