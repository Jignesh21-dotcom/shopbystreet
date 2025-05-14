import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type SegmentPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { city, street, segment } = params;

  // 1️⃣ Fetch street data
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      slug,
      city:city_id (
        slug
      )
    `)
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`, streetError);
    return <div className="p-6 text-red-600">❌ Street not found.</div>;
  }

  // Safely unwrap city data
  const cityData = Array.isArray(streetData.city) ? streetData.city[0] : streetData.city;

  if (!cityData || cityData.slug.toLowerCase() !== city.toLowerCase()) {
    console.error(`Street "${street}" does not belong to city "${city}".`);
    return <div className="p-6 text-red-600">❌ Street does not belong to city.</div>;
  }

  // 2️⃣ Fetch the segment by slugified name
  const { data: segmentData, error: segmentError } = await supabase
    .from('street_segments')
    .select('*')
    .eq('street_id', streetData.id)
    .ilike('name', decodeURIComponent(segment).replace(/-/g, ' ')) // Loose match
    .single();

  if (segmentError || !segmentData) {
    console.error(`Segment not found for street: ${street}`, segmentError);
    return <div className="p-6 text-red-600">❌ Segment not found for this street.</div>;
  }

  // 3️⃣ Fetch all approved shops for this street
  const { data: allShops, error: shopError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('streetSlug', streetData.slug)
    .eq('approved', true);

  if (shopError || !allShops) {
    console.error(`Failed to load shops for street: ${street}`, shopError);
    return <div className="p-6 text-red-600">❌ Could not load shops.</div>;
  }

  // 4️⃣ Filter shops by description range
  const rangeStart = segmentData.range_start || 0;
  const rangeEnd = segmentData.range_end || 99999;

  const filteredShops = allShops.filter((shop) => {
    const match = shop.description?.match(/^(\d+)/);
    const num = match ? parseInt(match[1]) : null;
    return num !== null && num >= rangeStart && num <= rangeEnd;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Street Link */}
      <Link href={`/cities/${city}/${street}`} className="text-blue-600 hover:underline mb-4 block">
        ← Back to Street
      </Link>

      {/* Segment Header */}
      <h1 className="text-3xl font-bold mb-2 text-blue-800">
        🧭 {segmentData.name}
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        From {segmentData.from_intersection} to {segmentData.to_intersection} (
        {segmentData.range_start}–{segmentData.range_end})
      </p>

      {/* Shops List */}
      {filteredShops.length === 0 ? (
        <p className="text-gray-600">No shops listed in this segment yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredShops.map((shop) => (
            <Link
              key={shop.id}
              href={`/cities/${city}/${street}/${shop.slug}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold text-blue-700">{shop.name}</h2>
              <p className="text-sm text-gray-600">{shop.description}</p>
              {shop.parking && <p className="text-xs mt-2 text-gray-500">🚗 {shop.parking}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}