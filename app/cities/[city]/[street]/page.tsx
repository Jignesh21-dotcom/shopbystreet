import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';

type StreetPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function StreetPage({ params }: StreetPageProps) {
  const { city, street } = params;

  // Fetch street data
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select('id, name, slug, city:city_id!inner (name, slug)')
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`);
    return <div>Street not found.</div>;
  }

  const cityData = Array.isArray(streetData.city) ? streetData.city[0] : streetData.city;
  if (!cityData || cityData.slug.toLowerCase() !== city.toLowerCase()) {
    console.error(
      `Validation failed: Street "${street}" does not belong to city "${city}".`,
      { streetCitySlug: cityData?.slug, citySlug: city }
    );
    return <div>Street not found in this city.</div>;
  }

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('street_id', streetData.id)
    .order('name', { ascending: true });

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${street}`, shopsError);
    return <div>No shops found for this street.</div>;
  }

  return (
    <StreetClient
      city={cityData.slug}
      street={streetData.slug}
      shops={shops}
    />
  );
}
