import Link from 'next/link';
import { getProvincesByCountrySlug } from '@/lib/data';
import ExpansionNotice from '@/app/components/ExpansionNotice';

// Define the props type explicitly
type Props = {
  params: Promise<{
    country: string;
  }>;
};

export default async function CountryPage({ params }: Props) {
  // Resolve the promise if params is asynchronous
  const resolvedParams = await params;
  const provinces = await getProvincesByCountrySlug(resolvedParams.country);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center">
      {/* Back to Home */}
      <Link
        href="/"
        className="self-start mb-6 text-purple-700 hover:text-purple-900 hover:underline"
      >
        ← Back to Home
      </Link>

      {/* Expansion Notice */}
      <ExpansionNotice />

      {/* Country Title */}
      <h1 className="text-4xl font-bold text-purple-800 mb-10 capitalize">
        🌎 {decodeURIComponent(resolvedParams.country).replace(/-/g, " ")}
      </h1>

      {/* Provinces List */}
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
  );
}