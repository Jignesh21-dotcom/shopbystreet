'use client';

import Link from 'next/link';

const foundingCities = [
  {
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    icon: '🏙️',
    status: 'Founding City',
    description:
      'Explore Founding Cities’s shopping streets, neighbourhood markets, independent retailers, food businesses, and local storefronts.',
    areas: ['C.G. Road', 'Law Garden', 'Manek Chowk', 'Ratan Pole'],
    href: '/countries/india/gujarat/ahmedabad',
    active: true,
  },
  {
    name: 'Surat',
    slug: 'surat',
    icon: '🧵',
    status: 'Founding City',
    description:
      'Discover Surat’s textile districts, commercial roads, local markets, fashion businesses, and independent shops.',
    areas: ['Ring Road', 'Textile Market', 'Ghod Dod Road', 'Athwa'],
    href: '/countries/india/gujarat/surat',
    active: true,
  },
  {
    name: 'Vadodara',
    slug: 'vadodara',
    icon: '🏛️',
    status: 'Founding City',
    description:
      'Browse Vadodara’s local businesses, shopping areas, community markets, services, and neighbourhood storefronts.',
    areas: ['Alkapuri', 'Sayajigunj', 'Mandvi', 'Fatehgunj'],
    href: '/countries/india/gujarat/vadodara',
    active: true,
  },
  {
    name: 'Rajkot',
    slug: 'rajkot',
    icon: '🛍️',
    status: 'Founding City',
    description:
      'Find Rajkot’s retailers, traditional markets, jewellery businesses, clothing stores, and independent local shops.',
    areas: ['Yagnik Road', 'Dhebar Road', 'Soni Bazaar', 'Kalavad Road'],
    href: '/countries/india/gujarat/rajkot',
    active: true,
  },
];

const discoverySteps = [
  {
    number: '1',
    title: 'Choose a city',
    description:
      'Begin with one of Gujarat’s founding or upcoming LocalStreetShop cities.',
  },
  {
    number: '2',
    title: 'Choose a market or shopping area',
    description:
      'Explore neighbourhood markets, shopping districts, and commercial areas.',
  },
  {
    number: '3',
    title: 'Walk the street online',
    description:
      'Browse local businesses in the same order and community in which they are found.',
  },
  {
    number: '4',
    title: 'Connect with a local shop',
    description:
      'View products, contact information, and available request or ordering options.',
  },
];

const foundingGoals = [
  'Map important markets and shopping streets',
  'Add a trusted first group of local businesses',
  'Invite shop owners to manage their storefronts',
  'Build city pages around real shopping habits',
  'Support Gujarati and English discovery over time',
  'Expand carefully through local partnerships',
];

export default function GujaratClient() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute -left-28 top-10 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-green-100 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/countries/india"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-700"
          >
            <span>←</span>
            Back to India
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              <span>🇮🇳</span>
              Gujarat Founding State
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Building Gujarat&apos;s Digital Main Street
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Discover Gujarat city by city, market by market, and street by
              street. LocalStreetShop is creating one digital experience for
              local businesses, traditional markets, and neighbourhood shopping
              communities.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#founding-cities"
                className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Explore Founding Cities
              </Link>

              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Join the Gujarat Launch
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ['🏙️', 'Founding Cities'],
                ['🛍️', 'Local Markets'],
                ['🛣️', 'Shopping Streets'],
                ['🏪', 'Independent Shops'],
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
                A Local Experience
              </p>

              <h2 className="mt-3 text-3xl font-black">
                More than a list of businesses
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                LocalStreetShop organizes discovery around the places where
                people actually shop: cities, neighbourhood markets, commercial
                areas, streets, and storefronts.
              </p>

              <div className="mt-6 grid gap-3">
                {discoverySteps.map((step) => (
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

      {/* FOUNDING CITIES */}
      <section
        id="founding-cities"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Founding Cities
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Start exploring Gujarat locally.
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Each city will be built around recognizable markets, shopping
              areas, commercial streets, and the businesses that make those
              communities unique.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
            Explore all four founding cities
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {foundingCities.map((city) => (
            <div
              key={city.slug}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex-1 p-7 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl">
                    {city.icon}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      city.active
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {city.status}
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-black text-slate-950">
                  {city.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {city.description}
                </p>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Featured shopping areas
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {city.areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-5">
                <Link
                  href={city.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  Explore {city.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY GUJARAT */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              Built With Local Knowledge
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Designed around how Gujarat actually shops.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Gujarat&apos;s local commerce is shaped by markets, neighbourhood
              areas, specialist districts, commercial roads, and trusted local
              relationships. The platform should reflect that experience rather
              than flattening every business into one general directory.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {foundingGoals.map((goal) => (
              <div
                key={goal}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="font-black text-green-600">✓</span>
                <span className="ml-3 font-semibold text-slate-800">
                  {goal}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Founding Partners
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Know Gujarat&apos;s shops, streets, or markets?
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Local introductions can help us identify the right markets,
              streets, businesses, and founding shop owners for each city.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Become a Founding Partner
              </Link>

              <Link
                href="/countries/india/business-owners"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                For Business Owners
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-black text-white">
              Help with the founding launch
            </h3>

            <div className="mt-5 grid gap-3">
              {[
                'Recommend a city or market',
                'Introduce trusted local shop owners',
                'Identify important shopping streets',
                'Share local business information',
                'Help test the browsing experience',
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
            Explore Gujarat
          </span>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            One state. Many cities, markets, streets, and local stories.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            All four founding cities now use one reusable city experience. From there, the Gujarat
            experience can grow one real local-shopping community at a time.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/countries/india/gujarat/ahmedabad"
              className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
            >
              Explore Founding Cities
            </Link>

            <Link
              href="/countries/india"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Back to India
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}