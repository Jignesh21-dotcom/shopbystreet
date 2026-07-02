'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) return null;

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filePath = `contact-files/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('contact-uploads')
      .upload(filePath, file);

    if (error) {
      console.error('File upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage
      .from('contact-uploads')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError(null);

    let fileUrl = null;

    if (file) {
      fileUrl = await uploadFile();

      if (!fileUrl) {
        setError('File upload failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from('contact_requests').insert([
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject,
        message: formData.message.trim(),
        file_url: fileUrl,
      },
    ]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
    });
    setFile(null);
    setLoading(false);
  };

  return (
    <>
      <SEO
        title="Contact LocalStreetShop | Support for Local Businesses"
        description="Contact LocalStreetShop for help with shop listings, product uploads, business claims, partnerships, or general questions."
        url="https://www.localstreetshop.com/contact-us"
      />

      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <section className="mb-10 rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              Contact LocalStreetShop
            </p>

            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              How can we help?
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
              Send us a message about shop listings, product uploads, business
              claims, partnerships, or general questions.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Common reasons to contact us
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                <p>
                  <span className="font-bold text-blue-700">Shop owners:</span>{' '}
                  ask about claiming your listing, adding products, or updating
                  business details.
                </p>

                <p>
                  <span className="font-bold text-blue-700">Local businesses:</span>{' '}
                  ask about joining LocalStreetShop or getting help with your
                  online storefront.
                </p>

                <p>
                  <span className="font-bold text-blue-700">Visitors:</span>{' '}
                  report incorrect business information or suggest a local area
                  we should add.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {success && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
                  Thanks! Your message has been received. We’ll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone number optional
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option>General Inquiry</option>
                    <option>Help Claiming My Shop</option>
                    <option>Help Adding Products</option>
                    <option>Incorrect Business Information</option>
                    <option>Partnership or Ambassador Question</option>
                    <option>Billing Question</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Attachment optional
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Max file size: 5 MB.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-700 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}