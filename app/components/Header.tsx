'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-green-400 to-blue-500 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold text-white hover:text-gray-100 transition">
          🛍️ Shop Street
        </Link>

        {/* Navigation Links */}
        <nav className="flex space-x-6 text-white text-lg">
          <Link href="/" className="hover:underline hover:text-gray-100">
            Home
          </Link>
          <Link href="/submit-street" className="hover:underline hover:text-gray-100">
  + Add Street
</Link>

          <Link href="/clearance" className="hover:underline hover:text-gray-100">
            Clearance
          </Link>
          <Link href="/countries/canada" className="hover:underline hover:text-gray-100">
            Canada
          </Link>
          <Link href="/discover" className="hover:underline hover:text-gray-100">
            Discover
          </Link>
          <Link href="/profile" className="hover:underline hover:text-gray-100">
  Profile
</Link>

          <Link href="/submit-shop" className="hover:underline hover:text-gray-100 font-semibold">
            + Register Your Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
