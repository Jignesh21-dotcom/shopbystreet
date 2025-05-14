// app/cities/[city]/[street]/page.tsx
import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';

type StreetPageProps = {
  params: Promise<{
    city: string;
    street: string;
  }>; // Temporarily use `Promise` to handle async params
};

export default async function StreetPage({ params }: StreetPageProps) {
  // Await the params to access the city and street parameters
  const resolvedParams = await params;
  const { city, street } = resolvedParams;

  // ✅ Fetch street data
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      slug,
      city:city_id (
        name,
        slug,
        province
      )
    `)
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`);
    return <div>Street not found.</div>;
  }

  const cityData = Array.isArray(streetData.city) ? streetData.city[0] : streetData.city;

  if (!cityData || cityData.slug.toLowerCase() !== city.toLowerCase()) {
    console.error(`Validation failed: Street "${street}" does not belong to city "${city}".`, {
      streetCitySlug: cityData?.slug,
      citySlug: city,
    });
    return <div>Street not found in this city.</div>;
  }

  const provinceSlug = cityData?.province || 'ontario';

  // ✅ Fetch segments (if any)
  const { data: segments, error: segmentsError } = await supabase
    .from('street_segments')
    .select('id, name, slug, from_intersection, to_intersection, range_start, range_end')
    .eq('street_id', streetData.id)
    .order('range_start', { ascending: true });

  if (segmentsError) {
    console.error('Failed to fetch street segments:', segmentsError);
  }

  // ✅ Fetch approved shops for the street
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('streetSlug', streetData.slug)
    .eq('approved', true)
    .order('sequence', { ascending: true });

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${street}`, shopsError);
    return <div>No shops found for this street.</div>;
  }

  return (
    <StreetClient
      province={provinceSlug}
      city={cityData.slug}
      street={streetData.slug} // for header display
      shops={shops}
      segments={segments || []}
    />
  );
}