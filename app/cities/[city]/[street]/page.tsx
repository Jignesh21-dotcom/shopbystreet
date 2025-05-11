import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';

type StreetPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function StreetPage({ params }: StreetPageProps) {
  // ✅ Decode and normalize the city and street slugs
  const citySlug = decodeURIComponent(params.city).toLowerCase();
  const streetSlug = decodeURIComponent(params.street).toLowerCase();

  // ✅ Fetch street and its related city (with province)
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      slug,
      city:city_id (
        name,
        slug,
        province_slug
      )
    `)
    .eq('slug', streetSlug)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${streetSlug}`, streetError);
    return <div>Street not found.</div>;
  }

  const cityData = Array.isArray(streetData.city) ? streetData.city[0] : streetData.city;

  // ✅ Validate that the street belongs to the correct city
  if (!cityData || cityData.slug.toLowerCase() !== citySlug) {
    console.error(`Validation failed: Street "${streetSlug}" does not belong to city "${citySlug}".`, {
      streetCitySlug: cityData?.slug,
      expectedCitySlug: citySlug,
    });
    return <div>Street not found in this city.</div>;
  }

  // ✅ Fetch all shops on this street
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('street_id', streetData.id)
    .order('name', { ascending: true });

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${streetSlug}`, shopsError);
    return <div>No shops found for this street.</div>;
  }

  return (
    <StreetClient
      province={cityData.province_slug}
      city={cityData.slug}
      street={streetData.slug}
      shops={shops}
    />
  );
}