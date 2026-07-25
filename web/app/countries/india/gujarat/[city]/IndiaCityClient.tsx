'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Street = {
  id: string;
  name: string;
  slug: string;
  shopCount: number;
};

type IndiaCityClientProps = {
  state: string;
  stateName: string;
  city: string;
  cityName: string;
  streets: Street[];
};

const cityProfiles: Record<
  string,
  {
    icon: string;
    description: string;
    focus: string[];
  }
> = {
  ahmedabad: {
    icon: '🏙️',
    description:
      'Discover commercial roads, neighbourhood shopping areas, traditional markets, specialist districts, and independent local businesses.',
    focus: ['Shopping Streets', 'Local Markets', 'Independent Shops', 'Food & Culture'],
  },
  surat: {
    icon: '🧵',
    description:
      'Explore textile districts, commercial roads, fashion businesses, neighbourhood markets, and independent local storefronts.',
    focus: ['Textiles', 'Fashion', 'Markets', 'Local Retail'],
  },
  vadodara: {
    icon: '🏛️',
    description:
      'Browse neighbourhood shopping areas, historic commercial districts, services, restaurants, and community businesses.',
    focus: ['Shopping Areas', 'Services', 'Restaurants', 'Community Shops'],
  },
  rajkot: {
    icon: '🛍️',
    description:
      'Discover traditional markets, jewellery businesses, clothing stores, commercial roads, and family-run local shops.',
    focus: ['Jewellery', 'Clothing', 'Markets', 'Family Businesses'],
  },
};

const experienceSteps = [
  {
    number: '1',
    title: 'Choose a street or market',
    description:
      'Begin with a familiar commercial road, market, neighbourhood, or shopping district.',
  },
  {
    number: '2',
    title: 'Walk the area online',
    description:
      'Browse approved businesses in address order through the Walk the Street experience.',
  },
  {
    number: '3',
    title: 'Open local shop profiles',
    description:
      'View business details, contact information, products, and available ordering options.',
  },
];

export default function IndiaCityClient({
  state,
  stateName,
  city,
  cityName,
  streets,
}: IndiaCityClientProps) {
  const [search, setSearch] = useState('');
  const profile = cityProfiles[city] || {
    icon: '🏙️',
    description:
      'Explore local shopping streets, markets, neighbourhood businesses, services, and independent storefronts.',
    focus: ['Shopping Streets', 'Markets', 'Local Shops', 'Food & Services'],
  };

  const filteredStreets = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return streets;

    return streets.filter((street) =>
      street.name.toLowerCase().includes(query)
    );
  }, [search, streets]);

  const liveStreetCount = streets.filter((street) => street.shopCount > 0).length;
  const totalShops = streets.reduce(
    (total, street) => total + street.shopCount,
    0
  );

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
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
              <span>{profile.icon}</span>
              Gujarat Founding City
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Explore {cityName}&apos;s Local Shopping Experience
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {profile.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#shopping-areas"
                className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Explore Streets and Markets
              </Link>

              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Recommend a Local Area
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {profile.focus.map((label, index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <span className="text-xl">
                    {['🛍️', '🌙', '🏪', '🍽️'][index] || '📍'}
                  </span>
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
                Walk {cityName} Online
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

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-orange-50 p-5">
            <p className="text-3xl font-black text-orange-700">{streets.length}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Founding streets and markets
            </p>
          </div>

          <div className="rounded-3xl bg-green-50 p-5">
            <p className="text-3xl font-black text-green-700">{liveStreetCount}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Areas with approved shops
            </p>
          </div>

          <div className="rounded-3xl bg-blue-50 p-5">
            <p className="text-3xl font-black text-blue-700">{totalShops}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Approved local businesses
            </p>
          </div>
        </div>
      </section>

      <section
        id="shopping-areas"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Streets, Markets and Shopping Areas
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Choose where you want to explore.
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Every card below comes from Supabase. Adding a new street or
              market to {cityName} will automatically add it to this city page.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Search {cityName}
            </label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a street, market, or shopping area..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        {filteredStreets.length > 0 ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {filteredStreets.map((street) => {
              const isLive = street.shopCount > 0;
              const streetHref = `/countries/india/${state}/${city}/streets/${street.slug}`;

              return (
                <div
                  key={street.id}
                  className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex-1 p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl">
                        📍
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          isLive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {isLive ? 'Live Area' : 'Founding Area'}
                      </span>
                    </div>

                    <h3 className="mt-6 text-3xl font-black text-slate-950">
                      {street.name}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      Walk {street.name} online and discover local businesses in
                      address order as they are added and approved.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        {street.shopCount}{' '}
                        {street.shopCount === 1 ? 'approved shop' : 'approved shops'}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        Walk the Street
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-5">
                    <Link
                      href={streetHref}
                      className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                    >
                      Explore {street.name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-orange-300 bg-orange-50 p-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
              Founding City
            </p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Streets are being prepared
            </h3>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
              Add the first streets or markets for {cityName} in Supabase and
              they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Build {cityName} With Us
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Know a shop, street, or market in {cityName}?
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Local knowledge will help us add the right shopping areas and
              invite founding shop owners to create their storefronts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Recommend a Local Business
            </Link>
            <p className="text-center text-sm text-slate-400">
              {cityName}, {stateName}, India
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}