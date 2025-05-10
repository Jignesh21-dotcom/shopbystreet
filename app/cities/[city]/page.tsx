import CityClient from './CityClient';
import { supabase } from '@/lib/supabaseClient';

type CityPageProps = {
  params: {
    city: string;
  };
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
  // Explicitly resolve the `params` object
  const city = params.city;

  // Fetch city data and streets on the server
  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', city)
    .single();

  if (cityError || !cityData) {
    throw new Error('City not found.');
  }

  const { data: streets, error: streetsError } = await supabase
    .from('streets')
    .select('name, slug')
    .eq('city_id', cityData.id)
    .order('name', { ascending: true });

  if (streetsError || !streets) {
    throw new Error('Failed to load streets.');
  }

  // Pass the fetched data to the client component
  return <CityClient city={cityData.name} streets={streets} />;
}