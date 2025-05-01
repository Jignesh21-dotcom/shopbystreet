'use client';

import { useEffect, useState } from 'react';
import shops from '@/data/shops.json';
import Link from 'next/link';

export default function ShopPage({
  params,
}: {
  params: { city: string; street: string; shop: string };
}) {
  const shop = shops.find((s) => s.slug === params.shop);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`reviews-${shop?.slug}`);
    setReviews(saved ? JSON.parse(saved) : []);
  }, [shop?.slug]);

  const submitReview = () => {
    if (review.trim().length === 0) return;
    const updated = [...reviews, review.trim()];
    setReviews(updated);
    localStorage.setItem(`reviews-${shop.slug}`, JSON.stringify(updated));
    setReview('');
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Shop not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col items-center">
      {/* Back to Street */}
      <Link
        href={`/cities/${params.city}/${params.street}`}
        className="self-start mb-4 text-yellow-700 hover:underline"
      >
        ← Back to Street
      </Link>

      {/* Shop Info */}
      <h1 className="text-4xl font-bold text-yellow-800 mb-4">{shop.name}</h1>
      <p className="mb-6 text-gray-700 text-lg">
        🚗 <strong>Parking:</strong> {shop.parking}
      </p>

      {/* Shop Story */}
      {shop.story ? (
        <div className="max-w-2xl bg-white shadow rounded-xl p-6 border-l-4 border-yellow-400 mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">✍️ Our Story</h2>
          <p className="text-gray-800 leading-relaxed">{shop.story}</p>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-10">No story available for this shop yet.</p>
      )}

      {/* 🔽 Review Input */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">💬 Leave a Quick Review</h2>
        <div className="flex items-center gap-3">
          <input
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What did you like?"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={submitReview}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* ✅ Review List */}
      {reviews.length > 0 && (
        <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow space-y-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">⭐ What People Are Saying</h2>
          {reviews.map((r, i) => (
            <p key={i} className="text-gray-800 border-l-4 border-yellow-300 pl-3 italic">
              “{r}”
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
