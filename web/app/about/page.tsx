'use client';

import Link from 'next/link';
import SEO from '@/app/components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About LocalStreetShop | Canada's Digital Main Street"
        description="Learn why LocalStreetShop was created and how we are building Canada's Digital Main Street to help people discover local businesses one street at a time."
        url="https://www.localstreetshop.com/about"
      />

      <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-6 inline-block text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:mb-8"
          >
            ← Back to Home
          </Link>

          <section className="mb-10 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
              About LocalStreetShop
            </p>

            <h1 className="mb-4 text-3xl font-extrabold sm:text-4xl md:text-5xl">
              Building Canada&apos;s Digital Main Street
            </h1>

            <p className="mx-auto max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
              LocalStreetShop helps Canadians discover local businesses by
              exploring real cities, real streets, real addresses, and real
              shops — one community at a time.
            </p>
          </section>

          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-blue-700">
              Why LocalStreetShop Exists
            </h2>

            <p className="mb-5 leading-relaxed text-gray-700">
              Local businesses are the heart of Canadian communities. They
              create jobs, support families, bring character to our streets, and
              make every neighbourhood feel unique.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700">
              But many small businesses are still difficult to discover online.
              Some have websites, some rely only on social media, and many are
              hidden behind search results where larger platforms and paid ads
              get most of the attention.
            </p>

            <p className="leading-relaxed text-gray-700">
              LocalStreetShop was created to give local businesses a better
              digital presence while keeping the feeling of real street-level
              discovery. Instead of only searching for a business, people can
              explore communities the way they actually exist — by province,
              city, street, address, and shop.
            </p>
          </section>

          <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-blue-800">
              Our Mission
            </h2>

            <p className="mb-5 leading-relaxed text-gray-700">
              Our mission is to build Canada&apos;s Digital Main Street — a
              community-first platform that helps people discover, support, and
              celebrate local businesses across the country.
            </p>

            <p className="leading-relaxed text-gray-700">
              We believe every local business deserves a chance to be seen
              online, whether they are on a busy downtown street, inside a
              plaza, operating from a home business, or serving a smaller
              community.
            </p>
          </section>

          <section className="mb-8 grid gap-4 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-2 font-bold text-blue-800">🛍️ For Shoppers</h3>
              <p className="text-sm leading-6 text-gray-700">
                Explore cities, streets, addresses, shops, and local deals
                before visiting in person.
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-2 font-bold text-green-800">
                🏪 For Businesses
              </h3>
              <p className="text-sm leading-6 text-gray-700">
                Claim your profile for free, share your story, update your
                business details, and showcase up to 100 products free during
                Phase 1.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-2 font-bold text-purple-800">
                🤝 For Communities
              </h3>
              <p className="text-sm leading-6 text-gray-700">
                Help local businesses get discovered through warm introductions,
                Community Partners, and shared support.
              </p>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-blue-700">
              Why Streets?
            </h2>

            <p className="mb-5 leading-relaxed text-gray-700">
              Most platforms organize businesses only by category, keyword, or
              paid ranking. LocalStreetShop is different. We organize discovery
              the way people naturally experience their communities — by walking
              real streets.
            </p>

            <p className="leading-relaxed text-gray-700">
              Whether someone is exploring King Street in Waterloo, downtown
              Kitchener, or a future community anywhere in Canada,
              LocalStreetShop helps them discover what is nearby, address by
              address and shop by shop.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-blue-700 p-5 text-white sm:p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold">
              Building a Community Movement
            </h2>

            <p className="mb-5 leading-relaxed text-blue-100">
              LocalStreetShop is more than a business directory. It is a growing
              community platform for shoppers, shop owners, home businesses,
              BIAs, local organizations, and Community Partners who want to help
              bring local discovery into the digital world.
            </p>

            <p className="leading-relaxed text-blue-100">
              Our growth is powered by storytelling, trust, and warm
              introductions. When someone shares LocalStreetShop with one local
              business owner, they help move Canada&apos;s Digital Main Street
              one step forward.
            </p>
          </section>

          <section className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-green-800">
              Founding Business Program
            </h2>

            <p className="mb-5 leading-relaxed text-gray-700">
              Claiming a business profile on LocalStreetShop is always free.
              During Phase 1, businesses can also showcase up to 100 products
              for free as we continue building the platform.
            </p>

            <p className="leading-relaxed text-gray-700">
              Future optional services may include Professional Store Setup,
              marketplace tools, and additional features for businesses that
              want extra support — but the core mission remains the same: help
              local businesses become easier to discover.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8">
            <h2 className="mb-3 text-2xl font-bold">
              Join Canada&apos;s Digital Main Street
            </h2>

            <p className="mx-auto mb-6 max-w-2xl text-gray-600">
              Whether you are a shopper, business owner, home entrepreneur,
              Community Partner, or someone who believes in supporting local,
              you can be part of the LocalStreetShop movement.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/countries/canada"
                className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 sm:w-auto"
              >
                Explore Streets
              </Link>

              <Link
                href="/shop-owner/claim"
                className="w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-green-700 sm:w-auto"
              >
                Claim Your Business
              </Link>

              <Link
                href="/community-partners"
                className="w-full rounded-full border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
              >
                Become a Community Partner
              </Link>

              <Link
                href="/support"
                className="w-full rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 sm:w-auto"
              >
                Support the Project
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}