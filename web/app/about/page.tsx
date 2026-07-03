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

      <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-6 text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:mb-8"
          >
            ← Back to Home
          </Link>

          <section className="mb-8 text-center sm:mb-10">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
              About LocalStreetShop
            </p>

            <h1 className="mb-3 text-3xl font-extrabold sm:mb-4 sm:text-4xl md:text-5xl">
              The Digital Main Street of Canada
            </h1>

            <p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg">
              We help Canadians discover local shops, support small businesses,
              and strengthen communities — one street at a time.
            </p>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-8 md:p-10">
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

          <section className="mb-6 grid gap-4 sm:mb-8 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
              <h3 className="font-bold text-blue-800 mb-2">
                🛍️ For Shoppers
              </h3>
              <p className="text-sm text-gray-700">
                Explore cities, streets, addresses, shops, and local deals
                before visiting in person.
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 sm:p-6">
              <h3 className="font-bold text-green-800 mb-2">
                🏪 For Businesses
              </h3>
              <p className="text-sm text-gray-700">
                Claim your listing, share your story, add products, and be
                discovered on your local street.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 sm:p-6">
              <h3 className="font-bold text-purple-800 mb-2">
                🤝 For Communities
              </h3>
              <p className="text-sm text-gray-700">
                Support main streets, local entrepreneurs, home businesses, and
                future Street Ambassadors.
              </p>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-8 md:p-10">
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

          <section className="mb-6 rounded-2xl bg-blue-700 p-5 text-white sm:mb-8 sm:p-8 md:p-10">
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

          <section className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold mb-3">
              Join Canada&apos;s Digital Main Street
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Whether you are a shopper, business owner, home entrepreneur, or
              future ambassador, you can be part of the LocalStreetShop movement.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/countries/canada"
                className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 sm:w-auto"
              >
                Explore Streets
              </Link>

              <Link
                href="/shop-owner"
                className="w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-green-700 sm:w-auto"
              >
                List Your Business
              </Link>

              <Link
                href="/street-ambassador"
                className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
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