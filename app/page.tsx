'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen w-full bg-cover bg-center text-white"
      style={{
        backgroundImage: `url('https://tse1.mm.bing.net/th?id=OIP.sjxOoT2piZkvHmRBKevBjwHaE7&pid=Api')`,
      }}
    >
      <div className="bg-black bg-opacity-60 min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 space-y-12 text-center">
        {/* 🛍️ Welcome Message */}
        <div className="space-y-6 max-w-3xl animate-fade-in">
          <h1 className="text-5xl font-bold opacity-0 animate-fade-in-up delay-100">🛍️ Welcome to Shop Street</h1>
          <p className="text-xl opacity-0 animate-fade-in-up delay-200">
            Discover authentic local businesses and explore real shops across Canadian streets.
            Support small, shop local, and experience Canada city by city.
          </p>
          <div className="opacity-0 animate-fade-in-up delay-300">
            <Link
              href="/countries/canada"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
            >
              🌎 Explore Canada
            </Link>
          </div>
        </div>

        {/* 🚧 Expansion Message */}
        <div className="bg-yellow-100 bg-opacity-90 text-yellow-900 rounded-lg p-6 max-w-3xl text-left space-y-4 shadow-lg animate-fade-in-up delay-500">
          <h2 className="text-2xl font-bold">🚧 We’re Expanding!</h2>
          <p>
            ShopByStreet is just getting started! Right now, we’re live with shops in{' '}
            <Link
              href="/cities/toronto"
              className="text-blue-600 underline hover:text-blue-800 font-semibold"
            >
              Toronto
            </Link>
            , and we’re working hard to add more cities and provinces across Canada—and soon, worldwide.
          </p>
          <div>
            <p className="font-semibold">✅ Current Available City:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>
                <Link
                  href="/cities/toronto"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Toronto
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

      {/* Tailwind Keyframe Animations */}
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

        .delay-100 { animation-delay: 0.1s; animation-fill-mode: forwards; }
        .delay-200 { animation-delay: 0.2s; animation-fill-mode: forwards; }
        .delay-300 { animation-delay: 0.3s; animation-fill-mode: forwards; }
        .delay-500 { animation-delay: 0.5s; animation-fill-mode: forwards; }
      `}</style>
    </main>
  );
}
