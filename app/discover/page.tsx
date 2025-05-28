import { supabaseServer } from '@/lib/supabaseServerClient';
import Link from 'next/link';
import SEO from '@/app/components/SEO';

type Shop = {
  id: string;
  name: string;
  slug: string;
  streetSlug: string;
  citySlug?: string;
  parking?: string;
  address?: string;
  group?: string;
  featured?: boolean;
  discount?: string;
  tagline?: string;
};

export default async function DiscoverPage() {
  const { data, error } = await supabaseServer
    .from('shops')
    .select('*')
    .limit(100);

  const shops = data as Shop[];
  if (error) {
    console.error('Failed to fetch shops:', error.message);
    return <div className="p-6 text-red-600">Error loading shops.</div>;
  }

  const featured = shops.find((s) => s.featured);
  const discounted = shops.find((s) => s.discount);
  const gem = shops.find((s) => s.tagline);

  const title = 'Discover Local Gems | Local Street Shop';
  const description = 'Explore featured businesses, hidden gems, and local discounts across Canadian cities. Handpicked highlights from Local Street Shop.';
  const url = 'https://www.localstreetshop.com/discover';

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-indigo-800 mb-10">🔍 Discover Local Highlights</h1>

        <div className="grid gap-8 w-full max-w-5xl">
          {featured && (
            <Card
              title="🏆 Editor's Pick"
              shop={featured}
              color="bg-yellow-100"
              highlight="Featured by our team"
            />
          )}

          {discounted && (
            <Card
              title="💰 On Sale Now"
              shop={discounted}
              color="bg-green-100"
              highlight={`Save ${discounted.discount}`}
            />
          )}

          {gem && (
            <Card
              title="📚 Local Gem"
              shop={gem}
              color="bg-blue-100"
              highlight={gem.tagline || "A hidden gem in your area!"}
            />
          )}
        </div>
      </main>
    </>
  );
}

function Card({
  title,
  shop,
  color,
  highlight,
}: {
  title: string;
  shop: Shop;
  color: string;
  highlight: string;
}) {
  return (
    <div className={`rounded-xl shadow-md p-6 ${color}`}>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-gray-700 text-lg mb-3">{shop.name}</p>
      <p className="italic text-sm text-gray-600 mb-4">{highlight}</p>
      <Link
        href={`/cities/toronto/${shop.streetSlug}/shops/${shop.slug}`}
        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        View Shop →
      </Link>
    </div>
  );
}
