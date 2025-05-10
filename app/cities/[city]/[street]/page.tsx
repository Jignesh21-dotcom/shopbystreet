import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';

type StreetPageProps = {
  params: {
    city: string;
    street: string;
  };
};

export default async function StreetPage({ params }: StreetPageProps) {
  const { city, street } = params;

  // Fetch street data on the server
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select('id, name, slug, city:city_id (name, slug)')
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`, streetError);
    return <div>Street not found.</div>; // Gracefully handle missing street
  }

  // Validate that the street belongs to the correct city
  if (!streetData.city || streetData.city.slug.toLowerCase() !== city.toLowerCase()) {
    console.error(
      `Validation failed: Street "${street}" does not belong to city "${city}".`,
      { streetCitySlug: streetData.city?.slug, citySlug: city }
    );
    return <div>Street not found in this city.</div>; // Gracefully handle mismatched city
  }

  // Fetch shops for the street
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('street_id', streetData.id)
    .order('name', { ascending: true });

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${street}`, shopsError);
    return <div>No shops found for this street.</div>; // Gracefully handle missing shops
  }

  // Pass the fetched data to the client component
  return (
    <StreetClient
      city={streetData.city.name}
      street={streetData.name}
      shops={shops}
    />
  );
}