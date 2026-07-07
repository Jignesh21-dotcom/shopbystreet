import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-12 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/lss-logo.png"
                alt="LocalStreetShop"
                width={52}
                height={52}
              />

              <div>
                <h2 className="text-2xl font-black text-blue-700">
                  LocalStreetShop
                </h2>

                <p className="text-sm text-slate-500">
                  Canada's Digital Main Street
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              Helping Canadians discover and support local businesses,
              one street at a time.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Explore
            </h3>

            <div className="space-y-3 text-slate-600">

              <Link href="/" className="block hover:text-blue-700">
                Home
              </Link>

              <Link href="/live-cities" className="block hover:text-blue-700">
                Live Cities
              </Link>

              <Link href="/deals" className="block hover:text-blue-700">
                Deals
              </Link>

              <Link href="/about" className="block hover:text-blue-700">
                About
              </Link>

            </div>
          </div>

          {/* Business */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Business Owners
            </h3>

            <div className="space-y-3 text-slate-600">

              <Link href="/pricing" className="block hover:text-blue-700">
                For Business Owners
              </Link>

              <Link href="/shop-owner/claim" className="block hover:text-blue-700">
                Claim Your Shop
              </Link>

              <Link href="/shop-owner" className="block hover:text-blue-700">
                Shop Owner Portal
              </Link>

              <Link href="/home-businesses" className="block hover:text-blue-700">
                Home Businesses
              </Link>

            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-slate-900">
              Community
            </h3>

            <div className="space-y-3 text-slate-600">

              <Link href="/street-ambassador" className="block hover:text-blue-700">
                Street Ambassador
              </Link>

              <Link href="/contact-us" className="block hover:text-blue-700">
                Contact
              </Link>

              <Link href="/privacy-policy" className="block hover:text-blue-700">
                Privacy Policy
              </Link>

            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">

          <p className="text-sm text-slate-500">
            Built with ❤️ for Canadian communities.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-700">
              LocalStreetShop™
            </span>
            . All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}