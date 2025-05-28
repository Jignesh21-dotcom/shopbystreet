import Link from 'next/link';
import { getProvincesByCountrySlug } from '@/lib/data';
import ExpansionNotice from '@/app/components/ExpansionNotice';
import SEO from '@/components/SEO';

type Props = {
  params: Promise<{
    country: string;
  }>;
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
          {provinces.map((province) => (
            <Link
              key={province.slug}
              href={`/provinces/${province.slug}`}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 text-center"
            >
              <h2 className="text-2xl font-semibold text-purple-700">{province.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
