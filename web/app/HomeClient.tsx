'use client';

import Link from 'next/link';

const discoveryCards = [
  {
    icon: '🏙️',
    title: 'Choose a city',
    description: 'Start with Canadian cities and explore local business communities.',
  },
  {
    icon: '🛣️',
    title: 'Pick a street',
    description: 'Browse real streets and discover what shops are located there.',
  },
  {
    icon: '🏪',
    title: 'Visit local shops',
    description: 'View business profiles, products, contact details, maps, and more.',
  },
];

const shopperBenefits = [
  'Discover shops by city and street',
  'Explore businesses before visiting',
  'Find local products and deals',
  'Support small businesses nearby',
  'Browse storefronts from your phone',
  'Experience local shopping street by street',
];

const communityCards = [
  {
    title: 'For Shoppers',
    icon: '🛍️',
    description:
      'Explore Canadian streets online and find local businesses worth visiting.',
    href: '/countries/canada',
    cta: 'Start Exploring',
  },
  {
    title: 'For Business Owners',
    icon: '🏪',
    description:
      'Claim your shop, showcase products, and grow your local visibility.',
    href: '/pricing',
    cta: 'For Business Owners',
  },
  {
    title: 'For Communities',
    icon: '🤝',
    description:
      'Help main streets, BIAs, and local business communities become easier to discover.',
    href: '/contact-us',
    cta: 'Partner With Us',
  },
];

export default function HomeClient() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-green-100 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Local shopping, street by street
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Canada&apos;s Digital Main Street
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Discover local shops, explore Canadian streets, find nearby products, and support
              small businesses in the communities around you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/countries/canada"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Explore Streets
              </Link>

              <Link
                href="/live-cities"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Browse Live Cities
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              {[
                ['🇨🇦', 'Built for Canada'],
                ['🏪', 'Local Shops'],
                ['🛣️', 'Street Discovery'],
                ['❤️', 'Support Local'],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="mt-1 block font-semibold text-slate-900">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 p-6 text-white">
                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                  <p className="text-sm font-semibold text-blue-50">Explore like a local</p>
                  <h2 className="mt-2 text-2xl font-black">
                    Walk Canadian streets online
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-blue-50">
                    Choose a city, pick a street, and discover shops address by address.
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    ['1', 'Choose a city', 'Start with places across Canada'],
                    ['2', 'Pick a street', 'Explore real local streets'],
                    ['3', 'Discover shops', 'Find businesses, products, and maps'],
                  ].map(([number, title, text]) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
                        {number}
                      </div>
                      <div>
                        <p className="font-bold">{title}</p>
                        <p className="text-sm text-slate-500">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-green-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-sm font-bold text-green-700">Shop local made easier</p>
              <p className="text-xs text-slate-500">Canada&apos;s Digital Main Street</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Explore Canada street by street.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            LocalStreetShop turns real streets into simple online discovery experiences,
            helping you find businesses before you visit in person.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {discoveryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {card.icon}
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{card.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOPPER VALUE */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              Built for local discovery
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Find what&apos;s around you before you step outside.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              LocalStreetShop helps shoppers discover local businesses the way people actually
              experience their communities — by city, street, address, and storefront.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {shopperBenefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="font-black text-green-300">✓</span>
                <span className="ml-3 font-semibold text-slate-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCE PATHS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              One Platform, Three Audiences
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Built for shoppers, businesses, and communities.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            LocalStreetShop connects people who want to shop local with the businesses and
            communities that make Canadian streets unique.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {communityCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  {card.icon}
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{card.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{card.description}</p>
              </div>

              <Link
                href={card.href}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-xl shadow-slate-200 md:p-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              For Business Owners
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Own a local business? Join the Founding Business Program.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
  Claiming and managing your basic business profile is always free. During
  Phase 1, businesses can also add photos and showcase up to 100 products
  for free as part of our Founding Business Program.
</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Learn More
              </Link>
              <Link
                href="/shop-owner/claim"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Claim Your Shop
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              Phase 1
            </p>
            <h3 className="mt-3 text-3xl font-black text-slate-950">
  Always free to claim
</h3>
            <p className="mt-3 leading-7 text-slate-600">
  Keep your business name, address, phone, website, hours, and social links
  up to date for free. Product showcase tools are free during Phase 1.
</p>

            <div className="mt-6 grid gap-3">
              {[
  'Claim profile free forever',
  'Update contact details',
  'Add website and social links',
  'Phase 1 product showcase',
].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="font-black text-green-600">✓</span>
                    <span className="font-semibold text-slate-700">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY PARTNERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-600/20 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
                BIAs, cities, and communities
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Helping main streets go digital.
              </h2>
              <p className="mt-5 text-lg leading-8 text-blue-50">
                LocalStreetShop helps communities showcase businesses street by street,
                strengthen local discovery, and support small businesses online.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'Showcase local streets',
                  'Support business visibility',
                  'Encourage local shopping',
                  'Create ambassador opportunities',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 p-4">
                    <span className="font-black text-green-200">✓</span>
                    <span className="ml-3 font-semibold text-white">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/contact-us"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200 sm:p-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Start Exploring
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Discover what&apos;s waiting on Canada&apos;s local streets.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Explore cities, browse streets, and find local businesses worth supporting.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/countries/canada"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Explore Streets
            </Link>
            <Link
              href="/live-cities"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Browse Live Cities
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}