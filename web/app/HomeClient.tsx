'use client';

import Link from 'next/link';


export default function HomePage() {
  
  return (
    <>
      

      <main
        className="min-h-screen w-full bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('/background/shopbycity-clean.png')`,
        }}
      >
        <div className="min-h-screen w-full bg-black bg-opacity-65 px-4 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            {/* HERO */}
            <section className="space-y-8 max-w-4xl animate-fade-in">
              <p className="text-sm md:text-base uppercase tracking-[0.25em] text-blue-100 font-semibold opacity-0 animate-fade-in-up delay-100">
                Local shopping, street by street
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight opacity-0 animate-fade-in-up delay-100 drop-shadow-xl">
                The Digital Main Street of Canada
              </h1>

              <p className="text-base sm:text-xl md:text-2xl font-light opacity-0 animate-fade-in-up delay-200 max-w-3xl mx-auto">
                Discover local shops, support small businesses, and strengthen
                communities — one street at a time.
              </p>

              <div className="opacity-0 animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                <Link
                  href="/countries/canada"
                  className="inline-block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
                >
                  🌎 Explore Streets
                </Link>

                <Link
                  href="/shop-owner"
                  className="inline-block w-full sm:w-auto text-center bg-white hover:bg-blue-50 text-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
                >
                  🏪 List Your Business
                </Link>

                <Link
                  href="/street-ambassador"
                  className="inline-block w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
                >
                  🤝 Become an Ambassador
                </Link>
              </div>
            </section>

            {/* MAIN MESSAGE */}
            <section className="bg-white bg-opacity-95 text-gray-900 rounded-3xl p-5 md:p-8 mt-10 sm:mt-16 max-w-5xl text-left space-y-6 shadow-2xl animate-fade-in-up delay-500">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
                  Built for local communities
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold">
                  A better way to discover local businesses
                </h2>

                <p className="mt-3 text-gray-700">
                  LocalStreetShop turns real Canadian streets into online
                  discovery experiences so shoppers can explore businesses by
                  city, street, address, and storefront.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="font-bold text-blue-800 mb-3">🧭 For Shoppers</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Walk real streets online</li>
                    <li>✓ Discover shops by city and street</li>
                    <li>✓ Explore before visiting in person</li>
                    <li>✓ Support local communities</li>
                  </ul>

                  <Link
                    href="/live-cities"
                    className="inline-block mt-5 text-blue-700 font-semibold hover:underline"
                  >
                    Browse live cities →
                  </Link>
                </div>

                <div className="rounded-2xl bg-purple-50 p-5">
                  <p className="font-bold text-purple-800 mb-3">
                    🏪 For Business Owners
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Claim your business listing</li>
                    <li>✓ Add products, hours, photos, and contact info</li>
                    <li>✓ Be discovered on your digital street</li>
                    <li>✓ Phase 1 owners keep product tools free</li>
                  </ul>

                  <Link
                    href="/shop-owner"
                    className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow transition"
                  >
                    Add or Claim Your Shop →
                  </Link>
                </div>

                <div className="rounded-2xl bg-green-50 p-5">
                  <p className="font-bold text-green-800 mb-3">
                    🤝 For Ambassadors
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Support local businesses</li>
                    <li>✓ Gain real-world experience</li>
                    <li>✓ Build communication and marketing skills</li>
                    <li>✓ Earn certificates and recognition</li>
                  </ul>

                  <Link
                    href="/street-ambassador"
                    className="inline-block mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow transition"
                  >
                    Join the Ambassador Program →
                  </Link>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="bg-white bg-opacity-95 text-gray-900 rounded-3xl p-5 md:p-8 mt-8 max-w-5xl w-full text-left shadow-2xl">
              <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
                How it works
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                Explore Canada street by street
              </h2>

              <div className="grid gap-4 md:grid-cols-5">
                {[
                  ['1', 'Choose a city'],
                  ['2', 'Pick a street'],
                  ['3', 'Walk address by address'],
                  ['4', 'Discover businesses'],
                  ['5', 'Shop local'],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center"
                  >
                    <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                      {number}
                    </div>
                    <p className="font-semibold text-gray-800">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* COMMUNITY SECTION */}
            <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl p-5 md:p-8 mt-8 max-w-5xl w-full text-left shadow-2xl">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <p className="text-sm uppercase tracking-widest text-blue-100 font-semibold mb-2">
                    For BIAs, cities, and local business communities
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                    Helping main streets go digital
                  </h2>

                  <p className="text-blue-100">
                    LocalStreetShop helps communities showcase local businesses
                    through a modern digital street experience while giving
                    shoppers a simple way to discover and support nearby shops.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-5">
                  <p className="font-bold mb-3">Community benefits</p>

                  <ul className="space-y-2 text-sm text-blue-50">
                    <li>✓ Showcase businesses street by street</li>
                    <li>✓ Support downtown and main street discovery</li>
                    <li>✓ Help businesses become visible online</li>
                    <li>✓ Create student ambassador opportunities</li>
                  </ul>

                  <Link
                    href="/contact-us"
                    className="inline-block mt-5 bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-50 transition"
                  >
                    Partner With Us →
                  </Link>
                </div>
              </div>
            </section>
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