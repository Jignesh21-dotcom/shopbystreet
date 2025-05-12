'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HomeBusinessesPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const { data, error } = await supabase.from('home_businesses').insert([
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

  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-blue-50 to-white text-gray-800 text-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">🏠 Local Home & Online Businesses</h1>

      <p className="text-lg max-w-3xl mx-auto mb-10">
        Not every great business has a storefront — some of the best are run from home or fully online!  
        We're here to support local entrepreneurs, side hustlers, and community makers by giving them a space to be discovered.
      </p>

      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Add Your Home Business</h2>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 max-w-xl mx-auto text-left space-y-4"
        >
          <div>
            <label className="block font-medium">Business Name</label>
            <input name="name" type="text" required className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-medium">City</label>
            <input name="city" type="text" required className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-medium">Description</label>
            <textarea name="description" rows={3} required className="w-full border rounded px-3 py-2"></textarea>
          </div>

          <div>
            <label className="block font-medium">Website / Social Media</label>
            <input name="website" type="text" className="w-full border rounded px-3 py-2" />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit My Business
          </button>
        </form>
      ) : (
        <p className="text-green-700 font-semibold text-lg">
          ✅ Thank you! We'll review and add your business shortly.
        </p>
      )}

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">🧾 Featured Home Businesses (Coming Soon)</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          We'll start listing approved home-based businesses right here soon — grouped by city or type. Stay tuned!
        </p>
      </div>
    </main>
  );
}
