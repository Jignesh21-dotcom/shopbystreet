'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ShopPageClientProps = {
  city: string;
  street: string;
  shop: string;
  shopData: {
    name: string;
    description?: string;
    parking?: string;
    image_url?: string;
    story?: string;
  };
};

export default function ShopPageClient({ city, street, shop, shopData }: ShopPageClientProps) {
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState<string[]>([]);

 const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapQuery = encodeURIComponent(shopData.description || shopData.name);

console.log('Google Maps API Key:', googleApiKey);
console.log('Map query address:', mapQuery);

  useEffect(() => {
    // Load reviews from localStorage
    const savedReviews = localStorage.getItem(`reviews-${shop}`);
    setReviews(savedReviews ? JSON.parse(savedReviews) : []);
  }, [shop]);

  const submitReview = () => {
    if (review.trim().length === 0) return;
    const updatedReviews = [...reviews, review.trim()];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews-${shop}`, JSON.stringify(updatedReviews));
    setReview('');
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col items-center">
      {/* Back to Street */}
      <Link
        href={`/cities/${city}/${street}`}
        className="self-start mb-4 text-yellow-700 hover:underline"
      >
        ← Back to Street
      </Link>

      {/* Shop Info */}
      <h1 className="text-4xl font-bold text-yellow-800 mb-4">{shopData.name}</h1>

      {shopData.description && (
        <p className="mb-4 text-gray-700 text-lg">
          📍 <strong>Address:</strong> {shopData.description}
        </p>
      )}

      {shopData.parking && (
        <p className="mb-6 text-gray-700 text-lg">
          🚗 <strong>Parking:</strong> {shopData.parking}
        </p>
      )}

      {/* Shop Image */}
      {shopData.image_url && (
        <img
          src={shopData.image_url}
          alt={shopData.name}
          className="w-full max-w-2xl rounded-lg shadow-md mb-6"
        />
      )}

      {/* Shop Story */}
      {shopData.story && (
        <div className="max-w-2xl bg-white shadow rounded-xl p-6 border-l-4 border-yellow-400 mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">✍️ Our Story</h2>
          <p className="text-gray-800 leading-relaxed">{shopData.story}</p>
        </div>
      )}

      {/* Map */}
      {googleApiKey && shopData.description && (
        <iframe
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${mapQuery}`}
          className="mb-10"
        />
      )}

      {/* Reviews */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">💬 Leave a Review</h2>
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

      {reviews.length > 0 && (
        <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow space-y-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">⭐ Reviews</h2>
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