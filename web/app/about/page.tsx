'use client';

import Link from 'next/link';
import SEO from '@/app/components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About LocalStreetShop | The Digital Main Street of Canada"
        description="Learn about LocalStreetShop's mission to help Canadians discover local shops, support small businesses, and strengthen communities one street at a time."
        url="https://www.localstreetshop.com/about"
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back to Home
          </Link>

          <section className="text-center mb-10">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              About LocalStreetShop
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              The Digital Main Street of Canada
            </h1>

            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              We help Canadians discover local shops, support small businesses,
              and strengthen communities — one street at a time.
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Our Mission
            </h2>

            <p className="text-gray-700 leading-relaxed mb-5">
              At <strong>LocalStreetShop</strong>, we believe local businesses
              are the heart of every community. They create jobs, support
              families, bring character to our streets, and make every city feel
              unique.
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              But in a world dominated by large online platforms and major
              corporations, many small businesses struggle to stay visible.
              LocalStreetShop was built to give local shops a stronger digital
              presence while keeping the feeling of real street-level discovery.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Our goal is simple: help people explore Canadian streets online,
              discover real local businesses, and support the shops that make
              their communities special.
            </p>
          </section>

          <section className="grid gap-5 md:grid-cols-3 mb-8">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-bold text-blue-800 mb-2">
                🛍️ For Shoppers
              </h3>
              <p className="text-sm text-gray-700">
                Explore cities, streets, addresses, shops, and local deals
                before visiting in person.
              </p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <h3 className="font-bold text-green-800 mb-2">
                🏪 For Businesses
              </h3>
              <p className="text-sm text-gray-700">
                Claim your listing, share your story, add products, and be
                discovered on your local street.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
              <h3 className="font-bold text-purple-800 mb-2">
                🤝 For Communities
              </h3>
              <p className="text-sm text-gray-700">
                Support main streets, local entrepreneurs, home businesses, and
                future Street Ambassadors.
              </p>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Why Streets?
            </h2>

            <p className="text-gray-700 leading-relaxed mb-5">
              Most platforms organize businesses only by category or search
              result. LocalStreetShop is different. We organize discovery the
              way people naturally experience their communities — by walking
              streets.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Whether someone is exploring King Street in Waterloo, a downtown
              street in Kitchener, or a future city across Canada, our platform
              helps them discover what is nearby, address by address and shop by
              shop.
            </p>
          </section>

          <section className="bg-blue-700 text-white rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Building a Community Movement
            </h2>

            <p className="text-blue-100 leading-relaxed mb-5">
              LocalStreetShop is more than a directory. It is a growing
              community platform for shoppers, shop owners, home businesses,
              BIAs, local organizations, and Street Ambassadors who want to help
              bring local shopping into the digital world.
            </p>

            <p className="text-blue-100 leading-relaxed">
              As we grow from Ontario to communities across Canada, our vision
              remains the same: strengthen local economies and help people
              rediscover the businesses around them.
            </p>
          </section>

          <section className="text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-3">
              Join Canada&apos;s Digital Main Street
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Whether you are a shopper, business owner, home entrepreneur, or
              future ambassador, you can be part of the LocalStreetShop movement.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/countries/canada"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow transition"
              >
                Explore Streets
              </Link>

              <Link
                href="/shop-owner"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow transition"
              >
                List Your Business
              </Link>

              <Link
                href="/street-ambassador"
                className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold shadow-sm transition"
              >
                Become an Ambassador
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}