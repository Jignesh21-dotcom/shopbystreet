'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

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

export default function ShopPageClient({
  city,
  street,
  shop,
  shopData,
}: ShopPageClientProps) {
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapQuery = encodeURIComponent(shopData.description || shopData.name);

  useEffect(() => {
    // Fetch user data (if logged in)
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };
    fetchUser();

    // Load reviews from localStorage
    const saved = localStorage.getItem(`reviews-${shop}`);
    setReviews(saved ? JSON.parse(saved) : []);
  }, [shop]);

  const submitReview = () => {
    if (review.trim().length === 0) return;
    const updated = [...reviews, review.trim()];
    setReviews(updated);
    localStorage.setItem(`reviews-${shop}`, JSON.stringify(updated));
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
      <div className="w-full max-w-2xl mb-10">
        {shopData.image_url ? (
          <img
            src={shopData.image_url}
            alt={shopData.name}
            className="w-full rounded-lg shadow-md object-cover max-h-72"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
            No image available
          </div>
        )}
      </div>

      {/* Shop Story */}
      {shopData.story ? (
        <div className="max-w-2xl bg-white shadow rounded-xl p-6 border-l-4 border-yellow-400 mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">✍️ Our Story</h2>
          <p className="text-gray-800 leading-relaxed">{shopData.story}</p>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-10">No story available for this shop yet.</p>
      )}

      {/* Map */}
      {googleApiKey && shopData.description && (
        <div className="w-full max-w-2xl mb-10">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">📍 Location</h2>
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${mapQuery}`}
          />
        </div>
      )}

      {/* Reviews */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">💬 Leave a Quick Review</h2>

        {user ? (
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
        ) : (
          <p className="text-gray-600 italic">
            🔒 Please{' '}
            <Link href="/login" className="text-yellow-700 hover:underline font-semibold">
              log in
            </Link>{' '}
            to leave a review.
          </p>
        )}
      </div>

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