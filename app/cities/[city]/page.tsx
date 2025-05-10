import CityClient from './CityClient';
import { supabase } from '@/lib/supabaseClient';

type CityPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

// ✅ Use `generateStaticParams` to handle dynamic routes
export async function generateStaticParams() {
  // Fetch all cities from the database
  const { data: cities, error } = await supabase
    .from('cities')
    .select('slug');

  if (error || !cities) {
    console.error('Failed to fetch cities:', error);
    return [];
  }

  return cities.map((city) => ({
    city: city.slug,
  }));
}

// ✅ Server Component for CityPage
export default async function CityPage({ params }: CityPageProps) {
  const city = params.city; // Explicitly access the city parameter

  // Fetch city data on the server
  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', city)
    .single();

  if (cityError || !cityData) {
    console.error(`City not found: ${city}`);
    return <div>City not found.</div>; // Gracefully handle missing city
  }

  // Fetch total count of streets for pagination
  const { count, error: countError } = await supabase
    .from('streets')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', cityData.id);

  if (countError || count === null) {
    console.error(`Failed to load streets for city: ${city}`);
    return <div>No streets found for this city.</div>; // Gracefully handle missing streets
  }

  const CHUNK_SIZE = 1000; // Define the chunk size for fetching streets
  const promises = [];

  // Fetch all streets in chunks
  for (let start = 0; start < count; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, count - 1);
    promises.push(
      supabase
        .from('streets')
        .select('name, slug')
        .eq('city_id', cityData.id)
        .order('name', { ascending: true })
        .range(start, end)
    );
  }

  const results = await Promise.all(promises);
  const streets = results.flatMap((result) => result.data ?? []);

  if (!streets.length) {
    console.error(`No streets found for city: ${city}`);
    return <div>No streets found for this city.</div>; // Gracefully handle empty streets
  }

  // Pass the fetched data to the client component
  return <CityClient city={cityData.name} streets={streets} />;
}