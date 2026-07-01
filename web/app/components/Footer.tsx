// app/components/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Brand */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-blue-700">
            LocalStreetShop
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            The Digital Main Street of Canada
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 mb-6">

          <Link href="/about" className="hover:text-blue-700 transition">
            About
          </Link>

          <Link href="/contact-us" className="hover:text-blue-700 transition">
            Contact
          </Link>

          <Link href="/privacy-policy" className="hover:text-blue-700 transition">
            Privacy Policy
          </Link>

          <Link href="/shop-owner" className="hover:text-blue-700 transition">
            Shop Owner
          </Link>

          <Link href="/street-ambassador" className="hover:text-blue-700 transition">
            Street Ambassador
          </Link>

          <Link href="/home-businesses" className="hover:text-blue-700 transition">
            Home Businesses
          </Link>

        </div>

        {/* Copyright */}
        <div className="border-t pt-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold">
            LocalStreetShop™
          </span>
          . All rights reserved.
        </div>

      </div>
    </footer>
  );
}