import Link from 'next/link';
import { getProvincesByCountrySlug } from '@/lib/data';
import ExpansionNotice from '@/app/components/ExpansionNotice';
import SEO from '@/app/components/SEO';

type Props = {
  params: Promise<{
    country: string;
  }>;
};

// Flag map (static reference to /public/flags/)
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

export default async function CountryPage({ params }: Props) {
  const resolvedParams = await params;
  const countrySlug = resolvedParams.country.toLowerCase();
  const countryDisplay = decodeURIComponent(countrySlug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const provinces = await getProvincesByCountrySlug(countrySlug);

  const title = `Explore Provinces in ${countryDisplay} | Local Street Shop`;
  const description = `Browse provinces in ${countryDisplay} and discover local businesses and shops city by city.`;
  const url = `https://www.localstreetshop.com/countries/${countrySlug}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center">
        <Link
          href="/"
          className="self-start mb-6 text-purple-700 hover:text-purple-900 hover:underline"
        >
          ← Back to Home
        </Link>

        <ExpansionNotice />

        <h1 className="text-4xl font-bold text-purple-800 mb-10 capitalize">
          🌎 {countryDisplay}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {provinces.map((province) => {
            const slug = province.slug.toLowerCase();
            const flag = provinceFlags[slug] || '/flags/ontario.png';

            return (
              <Link
                key={province.slug}
                href={`/provinces/${province.slug}`}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 text-center flex flex-col items-center gap-4"
              >
                <img
                  src={flag}
                  alt={`${province.name} flag`}
                  className="w-12 h-8 object-contain border rounded shadow"
                />
                <h2 className="text-2xl font-semibold text-purple-700">{province.name}</h2>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
