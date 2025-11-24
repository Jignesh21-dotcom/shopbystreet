'use client';

import Link from 'next/link';
import SEO from '@/app/components/SEO';

export default function HomePage() {
  const title = 'Shop Street | Discover Local Businesses & Local Deals Across Canada';
  const description =
    'Explore authentic local shops and 50%+ local deals across Canadian cities and streets. Support small businesses and take advantage of Phase 1 free product listings for shop owners.';
  const url = 'https://www.localstreetshop.com/';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main
        className="min-h-screen w-full bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('/background/shopbycity-clean.png')`,
        }}
      >
        <div className="bg-black bg-opacity-60 min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 text-center">
          {/* HERO */}
          <div className="space-y-8 max-w-3xl animate-fade-in">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight opacity-0 animate-fade-in-up delay-100 drop-shadow-xl">
              🛍️ Welcome to Local Street Shop
            </h1>

            <p className="text-xl md:text-2xl font-light opacity-0 animate-fade-in-up delay-200">
              Discover real local businesses on real streets across Canada. Browse cities, walk
              their streets online, and find 50%+ local deals while supporting small businesses.
            </p>

            {/* HERO BUTTONS */}
            <div className="opacity-0 animate-fade-in-up delay-300 flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                href="/countries/canada"
                className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
              >
                🌎 Explore Canada
              </Link>

              <Link
                href="/deals"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
              >
                🔥 View 50%+ Deals
              </Link>
            </div>
          </div>

          {/* INFO / PHASE 1 + LIVE CITIES + SHOP OWNERS */}
          <div className="bg-white bg-opacity-90 text-gray-900 rounded-xl p-6 mt-16 max-w-3xl text-left space-y-4 shadow-2xl animate-fade-in-up delay-500">
            <h2 className="text-2xl font-bold">🚧 We’re Expanding Across Canada</h2>
            <p>
              Local Street Shop is in early launch mode. Cities across Canada already have shops
              you can explore, and we’re adding more every week.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* For Shoppers */}
              <div>
                <p className="font-semibold mb-1">🧭 For Shoppers</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>
                    Discover local shops by city and street.{' '}
                    <Link
                      href="/live-cities"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      🏙️ Browse Live Cities
                    </Link>
                  </li>
                  <li>
                    Hunt for big savings on our{' '}
                    <Link
                      href="/deals"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      🔥 50%+ Local Deals
                    </Link>{' '}
                    page.
                  </li>
                  <li>More cities coming soon: Montreal, Vancouver, Ottawa, and more.</li>
                </ul>
              </div>

              {/* For Shop Owners – Phase 1 */}
              <div>
                <p className="font-semibold mb-1">🏪 For Shop Owners – Phase 1</p>
                <p className="text-sm mb-1">
                  We’re currently in <strong>Phase 1</strong>. During this limited-time launch
                  phase, there is <strong>no fee</strong> to add products to your shop.
                </p>
                <p className="text-sm mb-2">
                  After Phase 1 ends, product management will require a{' '}
                  <strong>$99 one-time activation fee</strong>. Shops that join during Phase 1 keep
                  product management <strong>free forever</strong>.
                </p>
                <Link
                  href="/shop-owner"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow transition"
                >
                  🚀 Add or Claim Your Shop (Free in Phase 1)
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }

          .delay-100 {
            animation-delay: 0.1s;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-300 {
            animation-delay: 0.3s;
          }
          .delay-500 {
            animation-delay: 0.5s;
          }
        `}</style>
      </main>
    </>
  );
}
