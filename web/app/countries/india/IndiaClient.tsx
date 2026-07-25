'use client';

import Link from 'next/link';

const launchCities = [
  {
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    icon: '🏙️',
    status: 'Founding City',
    description:
      'Explore Ahmedabad’s local streets, markets, independent retailers, food businesses, and neighbourhood shops.',
    href: '/countries/india/gujarat/ahmedabad',
    active: true,
  },
  {
    name: 'Surat',
    slug: 'surat',
    icon: '🧵',
    status: 'Founding City',
    description:
      'Discover Surat’s textile businesses, shopping districts, local markets, and independent storefronts.',
    href: '/countries/india/gujarat/surat',
    active: true,
  },
  {
    name: 'Vadodara',
    slug: 'vadodara',
    icon: '🏛️',
    status: 'Founding City',
    description:
      'Browse local businesses, commercial streets, community markets, and neighbourhood shopping areas.',
    href: '/countries/india/gujarat/vadodara',
    active: true,
  },
  {
    name: 'Rajkot',
    slug: 'rajkot',
    icon: '🛍️',
    status: 'Founding City',
    description:
      'Find local retailers, traditional markets, service businesses, and independent shops across Rajkot.',
    href: '/countries/india/gujarat/rajkot',
    active: true,
  },
];

const experienceSteps = [
  {
    number: '1',
    title: 'Choose a city',
    description: 'Start with a participating Gujarat city.',
  },
  {
    number: '2',
    title: 'Explore a market or street',
    description:
      'Browse local markets, shopping areas, and real commercial streets.',
  },
  {
    number: '3',
    title: 'Discover local businesses',
    description:
      'View shops, products, contact details, and available ordering options.',
  },
];

const launchBenefits = [
  'Discover businesses by city, street, and market',
  'Help independent shops become easier to find online',
  'Explore local products before visiting',
  'Connect directly with participating businesses',
  'Support neighbourhood shopping communities',
  'Create a digital presence for traditional markets',
];

export default function IndiaClient() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-orange-100 blur-3xl" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-green-100 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-700"
          >
            <span>←</span>
            Back to LocalStreetShop
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:px-8 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              <span>🇮🇳</span>
              India Expansion
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Discover Local India. Street by Street.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Experience Gujarat&apos;s local shopping streets, traditional markets,
              independent businesses, and neighbourhood communities through one
              digital local-shopping experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/countries/india/gujarat"
                className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Explore Gujarat
              </Link>

              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Partner With Us
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ['🇮🇳', 'India Launch'],
                ['📍', 'Starting in Gujarat'],
                ['🏪', 'Local Businesses'],
                ['🤝', 'Community Focused'],
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

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-500 via-white to-green-500 p-1">
                <div className="rounded-[1.35rem] bg-slate-950 p-6 text-white">
                  <p className="text-sm font-semibold text-orange-300">
                    Building Gujarat&apos;s Digital Main Street
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Traditional shopping streets, brought together online
                  </h2>

                  <p className="mt-4 leading-7 text-slate-300">
                    Choose a city, explore a market, area, or shopping street, and
                    discover the businesses that make each local community unique.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {experienceSteps.map((step) => (
                      <div
                        key={step.number}
                        className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 font-black text-white">
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

            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-green-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-sm font-bold text-green-700">ગુજરાતથી શરૂઆત</p>
              <p className="text-xs text-slate-500">Beginning with Gujarat</p>
            </div>
          </div>
        </div>
      </section>

      {/* GUJARAT LAUNCH */}
      <section
        id="gujarat-launch"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Gujarat Founding Launch
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Building Gujarat&apos;s Local Shopping Network
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              We are beginning with selected founding cities and will grow gradually
              through local businesses, shopping streets, markets, and community
              partnerships.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
            Founding launch in progress
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {launchCities.map((city) => (
            <div
              key={city.slug}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex-1 p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                    {city.icon}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      city.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {city.active ? 'Live City' : city.status}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-black text-slate-950">
                  {city.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {city.description}
                </p>

                <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-orange-800">
                  Explore local streets, shopping areas, shops, products, and
                  participating businesses.
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-5">
                {city.active ? (
                  <Link
                    href={city.href}
                    className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Explore {city.name}
                  </Link>
                ) : (
                  <div className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-500">
                    Launching Soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PURPOSE */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              Built for local discovery
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Bring traditional shopping streets and markets into one digital
              experience.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              LocalStreetShop is not another general business directory. It recreates
              the experience of discovering local businesses city by city, market by
              market, and street by street.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {launchBenefits.map((benefit) => (
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

      {/* BUSINESS OWNERS */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Gujarat Business Owners
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Become part of Gujarat&apos;s founding local-shopping network.
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              We are working with shop owners, market representatives, local business
              communities, and people who understand Gujarat&apos;s neighbourhood
              shopping areas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Contact LocalStreetShop
              </Link>

              <Link
                href="/business-owners"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Learn About the Platform
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-black text-white">
              Initial launch priorities
            </h3>

            <div className="mt-5 grid gap-3">
              {[
                'Select the first founding city',
                'Identify important markets and shopping streets',
                'Add the first group of founding businesses',
                'Invite shop owners to manage their profiles',
                'Test local discovery and customer requests',
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
            LocalStreetShop India
          </span>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Building Gujarat&apos;s Digital Main Street.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Starting with founding cities, local markets, shopping streets, and
            independent businesses — then growing carefully across India.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/countries/india/gujarat"
              className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
            >
              Open the Gujarat Experience
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Back to Global Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}