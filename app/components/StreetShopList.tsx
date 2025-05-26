'use client';

import { useState } from "react";
import Link from "next/link";

export default function StreetShopList({ shops, city, street }: { shops: any[]; city: string; street: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search shops..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 p-3 rounded-lg border border-blue-300 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Shops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {filteredShops.map((shop) => (
          <Link
            key={shop.slug}
            href={`/cities/${city}/${street}/shops/${shop.slug}`}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 text-center"
          >
            <h2 className="text-2xl font-semibold text-blue-700">{shop.name}</h2>
          </Link>
        ))}
      </div>
    </>
  );
}
