// app/components/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white text-center text-sm text-gray-500 py-6 shadow-inner border-t">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="mb-2 md:mb-0">
          © 2025 <span className="font-semibold">ShopByStreet™</span>. All rights reserved.
        </p>
        <div className="flex gap-4 font-semibold text-gray-600">
          <Link href="/about" className="hover:text-blue-700 transition">
            About
          </Link>
          <Link href="/contact-us" className="hover:text-blue-700 transition">
            Contact Us
          </Link>
          <Link href="/privacy-policy" className="hover:text-blue-700 transition">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
