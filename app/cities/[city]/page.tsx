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
    throw new Error('City not found.');
  }

  // Fetch total count of streets for pagination
  const { count, error: countError } = await supabase
    .from('streets')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', cityData.id);

  if (countError || count === null) {
    throw new Error('Failed to load streets.');
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
    throw new Error('Failed to load streets.');
  }

  // Pass the fetched data to the client component
  return <CityClient city={cityData.name} streets={streets} />;
}