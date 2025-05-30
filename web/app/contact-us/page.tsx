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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;
    const filePath = `contact-files/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('contact-uploads')
      .upload(filePath, file);

    if (error) {
      console.error('File upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('contact-uploads')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        ...formData,
        file_url: fileUrl,
      },
    ]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await fetch('https://hooks.zapier.com/hooks/catch/22913226/27y98q1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, fileUrl }),
      });
    } catch (zapError) {
      console.warn('Zapier webhook failed:', zapError);
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
        title="Contact Us | Shop Street"
        description="Have questions or need help with your shop listing? Reach out to the Shop Street team for support and guidance."
        url="https://www.localstreetshop.com/contact-us"
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="mb-6 text-gray-600">
          Need help listing products or have a general question? Send us a message below.
        </p>

        {success && <p className="mb-4 text-green-600">Thanks! We'll get back to you soon.</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number (optional)"
            className="w-full p-2 border rounded"
          />

          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option>General Inquiry</option>
            <option>Help Listing My Shop</option>
            <option>Add Products for Me</option>
            <option>Billing Question</option>
          </select>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows={5}
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
}
