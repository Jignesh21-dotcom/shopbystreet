'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen w-full bg-cover bg-center text-white"
      style={{
        backgroundImage: `url('/background/shopbycity-clean.png')`,
      }}
    >
      <div className="bg-black bg-opacity-60 min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="space-y-8 max-w-3xl animate-fade-in">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight opacity-0 animate-fade-in-up delay-100 drop-shadow-xl">
            🛍️ Welcome to Shop Street
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-0 animate-fade-in-up delay-200">
            Discover authentic local businesses and explore real shops across Canadian streets.
            Support small, shop local, and experience Canada—city by city.
          </p>
          <div className="opacity-0 animate-fade-in-up delay-300">
            <Link
              href="/countries/canada"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
            >
              🌎 Explore Canada
            </Link>
          </div>
        </div>

        <div className="bg-white bg-opacity-90 text-gray-900 rounded-xl p-6 mt-16 max-w-3xl text-left space-y-4 shadow-2xl animate-fade-in-up delay-500">
          <h2 className="text-2xl font-bold">🚧 We’re Expanding!</h2>
          <p>
            ShopByStreet is just getting started! Cities across Canada already have shops you can explore — and we're adding more every week.
          </p>
          <div>
            <p className="font-semibold">✅ Cities with Live Shops:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>
                <Link
                  href="/live-cities"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  🏙️ Browse Live Cities
                </Link>
              </li>
            </ul>
            <p className="font-semibold">🚀 Coming Soon:</p>
            <ul className="list-disc ml-6">
              <li>Montreal</li>
              <li>Vancouver</li>
              <li>Ottawa</li>
              <li>...and more!</li>
            </ul>
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

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </main>
  );
}
