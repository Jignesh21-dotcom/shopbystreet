'use client';

import { useEffect, useState } from 'react';
import shops from '@/data/shops.json';
import streets from '@/data/streets.json';

export default function ProfilePage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [reviews, setReviews] = useState<number>(0);

  useEffect(() => {
    const favs = localStorage.getItem('favorites');
    setFavorites(favs ? JSON.parse(favs) : []);

    const seen = localStorage.getItem('visitedStreets');
    setVisited(seen ? JSON.parse(seen) : []);

    let totalReviews = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('reviews-')) {
        const val = JSON.parse(localStorage.getItem(key)!);
        totalReviews += Array.isArray(val) ? val.length : 0;
      }
    });
    setReviews(totalReviews);
  }, []);

  const points = visited.length * 5 + favorites.length * 3 + reviews * 10;

  const badges = [
    visited.length >= 3 && '🗺️ Street Explorer',
    favorites.length >= 5 && '💖 Shop Lover',
    reviews >= 3 && '📝 Reviewer',
    points >= 100 && '🏅 Super Shopper',
  ].filter(Boolean);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-indigo-800 mb-6">👤 Your Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl mb-8">
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">🎯 Your Points</h2>
        <p className="text-3xl font-bold text-indigo-900 mb-4">{points} pts</p>

        {badges.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-indigo-600">🏆 Badges Earned</h2>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              {badges.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Favorites */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl mb-8">
        <h2 className="text-lg font-semibold text-pink-700 mb-2">❤️ Favorite Shops</h2>
        {favorites.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {favorites.map((slug) => {
              const shop = shops.find((s) => s.slug === slug);
              return shop ? <li key={slug}>{shop.name}</li> : null;
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">You haven’t favorited any shops yet.</p>
        )}
      </div>

      {/* Visited */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">🚶 Streets Explored</h2>
        {visited.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-800">
            {visited.map((slug) => {
              const street = streets.find((s) => s.slug === slug);
              return street ? <li key={slug}>{street.name}</li> : null;
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Start walking some streets to earn points!</p>
        )}
      </div>
    </main>
  );
}
