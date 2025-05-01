'use client';

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center p-10 text-center">
      {/* Image or banner placeholder */}
      <img
        src="https://images.pexels.com/photos/29290069/pexels-photo-29290069.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        alt="Montreal Street Shopping"
        className="w-full max-w-4xl rounded-xl shadow-md mb-10"
      />
      
      {/* Heading */}
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        🛍️ Welcome to Shop Street
      </h1>

      {/* Description */}
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Discover authentic local businesses and explore real shops across Canadian streets. Support small, shop local, and experience Canada city by city.
      </p>

      {/* 🌎 Global Vision Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8 text-center max-w-2xl">
        <p className="text-lg text-blue-800 font-medium">
          🌎 This is just the beginning! We’re starting with Canada 🇨🇦, but soon you’ll be able to explore and shop streets from cities all around the world.
          Stay tuned as we bring local shopping to every corner of the globe! 🛍️✨
        </p>
      </div>

      {/* Explore button */}
      <Link
        href="/countries/canada"
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
      >
        🌎 Explore Canada
      </Link>
    </main>
  );
}
