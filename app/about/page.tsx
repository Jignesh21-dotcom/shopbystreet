'use client';

import Link from 'next/link';
import SEO from '@/components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us | Shop Street"
        description="Learn more about Shop Street's mission to empower local businesses and bring the joy of street-level shopping online."
        url="https://www.localstreetshop.com/about"
      />

      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col items-center p-6">
        {/* ✅ Hero Section */}
        <div className="w-full max-w-4xl text-center mb-10">
          <h1 className="text-5xl font-bold text-yellow-800 mb-4">About Us</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Empowering Local Businesses. Strengthening Communities.
          </p>
        </div>

        {/* ✅ Content Section */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 text-gray-800">
          <p className="mb-6">
            At <span className="font-semibold text-yellow-700">Shop Street</span>, we believe that <strong>local businesses are the heart and soul of every community.</strong>
          </p>

          <p className="mb-6">
            In today’s fast-moving world—where major corporations and online giants dominate—many small, local shops have struggled to keep up. Neighborhood stores, family-run restaurants, and independent boutiques that once thrived have faced mounting challenges just to stay visible and competitive.
          </p>

          <p className="mb-6">
            We built this platform with <span className="font-semibold text-yellow-700">one clear mission:</span> <strong>To give local businesses a fighting chance in the online world.</strong>
          </p>

          <p className="mb-6">
            <span className="font-semibold text-yellow-700">Shop Street</span> allows people to explore their cities street by street, discovering real stores in their own neighborhoods—from the corner bakery to hidden gem boutiques. Our goal is to bring the experience of “walking down the street” into the digital age, making it easy and fun to discover, support, and shop from local businesses.
          </p>

          <h2 className="text-2xl font-semibold text-yellow-700 mt-8 mb-4">Why It Matters:</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>🛍️ <strong>Support Local Jobs & Families:</strong> Every dollar spent locally helps sustain jobs and dreams.</li>
            <li>🏙️ <strong>Keep Communities Vibrant:</strong> Local businesses make our streets lively, unique, and full of character.</li>
            <li>🚀 <strong>Level the Playing Field:</strong> We give small shops powerful tools to stand tall in the age of online shopping.</li>
          </ul>

          <p className="mb-6">
            We’re passionate about reviving the magic of local shopping, empowering small businesses to compete, and making it easy for you to discover and support them.
          </p>

          <p className="text-yellow-700 font-semibold text-center">
            Thank you for being part of this movement. Together, we can keep our communities thriving—one street at a time. 💛
          </p>
        </div>

        {/* ✅ Back to Home */}
        <Link
          href="/"
          className="mt-10 inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
