'use client';

import Link from 'next/link';

const shoppingAreas = [
  {
    name: 'C.G. Road',
    slug: 'cg-road',
    icon: '🛍️',
    type: 'Shopping Street',
    status: 'Prototype Ready',
    description:
      'Explore fashion stores, jewellery shops, cafés, services, and established local businesses along one of Ahmedabad’s best-known commercial roads.',
    highlights: ['Fashion', 'Jewellery', 'Cafés', 'Services'],
    href: '/countries/india/gujarat/ahmedabad/streets/cg-road',
    active: true,
  },
  {
    name: 'Law Garden',
    slug: 'law-garden',
    icon: '🌙',
    type: 'Market Area',
    status: 'Preparing',
    description:
      'Discover local clothing, handicrafts, accessories, food stalls, and neighbourhood businesses around the Law Garden area.',
    highlights: ['Handicrafts', 'Clothing', 'Accessories', 'Food'],
    href: '/countries/india/gujarat/ahmedabad/law-garden',
    active: false,
  },
  {
    name: 'Manek Chowk',
    slug: 'manek-chowk',
    icon: '🍽️',
    type: 'Traditional Market',
    status: 'Preparing',
    description:
      'Experience a historic market area known for changing throughout the day, with local commerce, jewellery, food, and community activity.',
    highlights: ['Food', 'Jewellery', 'Traditional Market', 'Local Culture'],
    href: '/countries/india/gujarat/ahmedabad/manek-chowk',
    active: false,
  },
  {
    name: 'Ratan Pole',
    slug: 'ratan-pole',
    icon: '👗',
    type: 'Shopping District',
    status: 'Preparing',
    description:
      'Browse traditional clothing, fabrics, wedding shopping, family-run stores, and specialist local businesses.',
    highlights: ['Textiles', 'Traditional Wear', 'Wedding Shopping', 'Retail'],
    href: '/countries/india/gujarat/ahmedabad/ratan-pole',
    active: false,
  },
  {
    name: 'Sindhi Market',
    slug: 'sindhi-market',
    icon: '🧵',
    type: 'Local Market',
    status: 'Future Area',
    description:
      'Discover clothing, fabrics, everyday products, and independent local retailers in a familiar market setting.',
    highlights: ['Clothing', 'Fabrics', 'Everyday Shopping', 'Local Retail'],
    href: '/countries/india/gujarat/ahmedabad/sindhi-market',
    active: false,
  },
  {
    name: 'Satellite',
    slug: 'satellite',
    icon: '🏙️',
    type: 'Neighbourhood Shopping',
    status: 'Future Area',
    description:
      'Explore neighbourhood shops, restaurants, services, modern retail, and local businesses serving nearby communities.',
    highlights: ['Restaurants', 'Services', 'Modern Retail', 'Neighbourhood Shops'],
    href: '/countries/india/gujarat/ahmedabad/satellite',
    active: false,
  },
];

const experienceSteps = [
  {
    number: '1',
    title: 'Choose a shopping area',
    description:
      'Start with a market, commercial road, neighbourhood, or traditional shopping district.',
  },
  {
    number: '2',
    title: 'Explore streets and businesses',
    description:
      'See the local shops, services, restaurants, and storefronts connected to that area.',
  },
  {
    number: '3',
    title: 'View local shop profiles',
    description:
      'Open business details, products, contact information, and available ordering options.',
  },
];

const cityBenefits = [
  'Browse Ahmedabad by real shopping areas',
  'Discover traditional and modern local commerce',
  'Find shops before travelling to the area',
  'Explore products from participating businesses',
  'Support independent and family-run storefronts',
  'Build a richer city experience with local knowledge',
];

export default function AhmedabadClient() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-green-100 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/countries/india/gujarat"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-700"
          >
            <span>←</span>
            Back to Gujarat
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              <span>🏙️</span>
              Gujarat Founding City
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Explore Ahmedabad&apos;s Local Shopping Experience
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Discover Ahmedabad through its commercial roads, neighbourhood
              shopping areas, traditional markets, specialist districts, and
              independent local businesses.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#shopping-areas"
                className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Explore Shopping Areas
              </Link>

              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Recommend a Local Area
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ['🛍️', 'Shopping Streets'],
                ['🌙', 'Local Markets'],
                ['🏪', 'Independent Shops'],
                ['🍽️', 'Food & Culture'],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">
                Walk Ahmedabad Online
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Start with the place people know
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Instead of searching one large directory, begin with a familiar
                market, neighbourhood, commercial road, or shopping district.
              </p>

              <div className="mt-6 grid gap-3">
                {experienceSteps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 font-black text-white">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-bold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOPPING AREAS */}
      <section
        id="shopping-areas"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Markets and Shopping Areas
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Choose where you want to explore.
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Ahmedabad&apos;s prototype begins with recognizable shopping
              areas. Each area can later contain streets, shops, products, and
              a true Walk the Street experience.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
            C.G. Road prototype opens first
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {shoppingAreas.map((area) => (
            <div
              key={area.slug}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex-1 p-7 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl">
                    {area.icon}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      area.active
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {area.status}
                  </span>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  {area.type}
                </p>

                <h3 className="mt-2 text-3xl font-black text-slate-950">
                  {area.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {area.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {area.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-5">
                {area.active ? (
                  <Link
                    href={area.href}
                    className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Explore {area.name}
                  </Link>
                ) : (
                  <div className="flex w-full items-center justify-center rounded-full border border-dashed border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-500">
                    Area experience being prepared
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CITY EXPERIENCE */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              A City Built Around Local Commerce
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Ahmedabad is more than one shopping district.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              The city experience can connect modern commercial roads,
              traditional markets, neighbourhood shopping areas, food
              communities, and specialist retail districts without losing their
              individual identities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cityBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="font-black text-green-600">✓</span>
                <span className="ml-3 font-semibold text-slate-800">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL CONTRIBUTORS */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Ahmedabad Founding Contributors
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Help us represent Ahmedabad accurately.
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Local knowledge will help identify the right areas, streets,
              markets, shop owners, categories, and details for the first
              Ahmedabad experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Share Local Knowledge
              </Link>

              <Link
                href="/business-owners"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                For Shop Owners
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-black text-white">
              Help shape the city prototype
            </h3>

            <div className="mt-5 grid gap-3">
              {[
                'Recommend important markets and areas',
                'Identify the best first shopping street',
                'Introduce trusted Ahmedabad shop owners',
                'Review business categories and local wording',
                'Test the browsing flow before launch',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/5 p-4"
                >
                  <span className="font-black text-green-300">✓</span>
                  <span className="font-semibold text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-green-50 p-8 text-center shadow-xl shadow-slate-200 sm:p-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            First Ahmedabad Prototype
          </span>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Next stop: C.G. Road.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            We&apos;ll use C.G. Road to prototype the complete street-level
            experience, including storefronts, business cards, categories, and
            the future Walk the Street layout.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/countries/india/gujarat/ahmedabad/streets/cg-road"
              className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
            >
              Explore C.G. Road
            </Link>

            <Link
              href="/countries/india/gujarat"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Back to Gujarat
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}