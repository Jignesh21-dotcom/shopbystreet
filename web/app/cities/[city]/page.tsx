import CityClient from './CityClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type CityPageProps = {
  params: any;
};

export async function generateStaticParams() {
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

export default async function CityPage({ params }: CityPageProps) {
  const resolvedParams = await params;
  const city = resolvedParams.city;

  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', city)
    .single();

  if (cityError || !cityData) {
    console.error(`City not found: ${city}`);
    return <div>City not found.</div>;
  }

  // Use the view for count and fetching streets with shops
  const { count, error: countError } = await supabase
    .from('streets_with_shops')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', cityData.id);

  if (countError || count === null) {
    console.error(`Failed to load streets for city: ${city}`);
    return <div>No streets found for this city.</div>;
  }

  const CHUNK_SIZE = 1000;
  const promises = [];

  for (let start = 0; start < count; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, count - 1);
    promises.push(
      supabase
        .from('streets_with_shops')
        .select('id, name, slug, lat, lon, city_id, shop_count')
        .eq('city_id', cityData.id)
        .order('name', { ascending: true })
        .range(start, end)
    );
  }

  const results = await Promise.all(promises);
  const streets = results.flatMap((result) => result.data ?? []);

  const title = `Explore Streets in ${cityData.name} | Local Street Shop`;
  const description = `Browse all streets in ${cityData.name}, Ontario. Discover local businesses, shop small, and explore neighborhoods.`;
  const url = `https://www.localstreetshop.com/cities/${city}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
      {streets.length > 0 ? (
        <CityClient city={cityData.name} streets={streets} />
      ) : (
        city.toLowerCase() === 'toronto' ? (
          <div>No streets found for this city.</div>
        ) : (
          <CityClient city={cityData.name} streets={[]} />
        )
      )}
    </>
  );
}