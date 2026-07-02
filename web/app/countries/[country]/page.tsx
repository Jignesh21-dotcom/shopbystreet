import Image from 'next/image';
import Link from 'next/link';
import { getProvincesByCountrySlug } from '@/lib/data';
import ExpansionNotice from '@/app/components/ExpansionNotice';
import SEO from '@/app/components/SEO';

type Props = {
  params: Promise<{
    country: string;
  }>;
};

const provinceFlags: Record<string, string> = {
  ontario: '/flags/ontario.png',
  quebec: '/flags/quebec.png',
  'british-columbia': '/flags/british-columbia.png',
  alberta: '/flags/alberta.png',
  manitoba: '/flags/manitoba.png',
  saskatchewan: '/flags/saskatchewan.png',
  'nova-scotia': '/flags/nova-scotia.png',
  'new-brunswick': '/flags/new-brunswick.png',
  'newfoundland-and-labrador': '/flags/newfoundland-and-labrador.png',
  'prince-edward-island': '/flags/prince-edward-island.png',
  'northwest-territories': '/flags/northwest-territories.png',
  nunavut: '/flags/nunavut.png',
  yukon: '/flags/yukon.png',
};

const formatSlug = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default async function CountryPage({ params }: Props) {
  const resolvedParams = await params;
  const countrySlug = resolvedParams.country.toLowerCase();
  const countryDisplay = formatSlug(countrySlug);

  const provinces = await getProvincesByCountrySlug(countrySlug);

  const title = `Explore Provinces in ${countryDisplay} | LocalStreetShop`;
  const description = `Browse provinces in ${countryDisplay} and discover local businesses, restaurants, services, and shops city by city.`;
  const url = `https://www.localstreetshop.com/countries/${countrySlug}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            ← Back to Home
          </Link>

          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
              LocalStreetShop Country Directory
            </p>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Explore {countryDisplay}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
              Browse provinces across {countryDisplay} and discover independent
              businesses, restaurants, cafés, services, and shops city by city.
            </p>
          </section>

          <div className="mt-6">
            <ExpansionNotice />
          </div>

          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                  Provinces
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                  Choose a province to start exploring
                </h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                {provinces.length}{' '}
                {provinces.length === 1 ? 'province' : 'provinces'} available
              </p>
            </div>

            {provinces.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {provinces.map((province) => {
                  const slug = province.slug.toLowerCase();
                  const flag = provinceFlags[slug] || '/flags/ontario.png';

                  return (
                    <Link
                      key={province.slug}
                      href={`/provinces/${province.slug}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-16 items-center justify-center rounded-2xl bg-blue-50">
                          <Image
                            src={flag}
                            alt={`${province.name} flag`}
                            width={48}
                            height={32}
                            className="rounded border border-slate-200 object-contain shadow-sm"
                          />
                        </div>

                        <div>
                          <h3 className="text-2xl font-extrabold text-slate-950 transition group-hover:text-blue-700">
                            {province.name}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            Local cities and businesses
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-slate-600">
                        Discover shops, services, restaurants, cafés, and local
                        businesses across {province.name}.
                      </p>

                      <p className="mt-5 font-bold text-blue-700">
                        Explore Province →
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  No provinces found
                </h2>
                <p className="mt-2 text-slate-600">
                  Provinces for {countryDisplay} are not available yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}