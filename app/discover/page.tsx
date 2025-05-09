import shops from "@/data/shops.json";
import Link from "next/link";

// Define the shop type
type Shop = {
  name: string;
  slug: string;
  streetSlug: string;
  parking: string;
  address: string;
  group: string;
  featured?: boolean; // Optional featured property
  discount?: string; // Optional discount property
  tagline?: string; // Optional tagline property
};

export default function DiscoverPage() {
  const featured = (shops as Shop[]).find((s) => s.featured);
  const discounted = (shops as Shop[]).find((s) => s.discount);
  const gem = (shops as Shop[]).find((s) => s.tagline);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-indigo-800 mb-10">🔍 Discover Local Highlights</h1>

      <div className="grid gap-8 w-full max-w-5xl">
        {/* Editor's Pick */}
        {featured && (
          <Card
            title="🏆 Editor's Pick"
            shop={featured}
            color="bg-yellow-100"
            highlight="Featured by our team"
          />
        )}

        {/* On Sale */}
        {discounted && (
          <Card
            title="💰 On Sale Now"
            shop={discounted}
            color="bg-green-100"
            highlight={`Save ${discounted.discount}`}
          />
        )}

        {/* Local Gem */}
        {gem && (
          <Card
            title="📚 Local Gem"
            shop={gem}
            color="bg-blue-100"
            highlight={gem.tagline || "A hidden gem in your area!"} // Provide a fallback value
          />
        )}
      </div>
    </main>
  );
}

function Card({ title, shop, color, highlight }: { title: string; shop: Shop; color: string; highlight: string }) {
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