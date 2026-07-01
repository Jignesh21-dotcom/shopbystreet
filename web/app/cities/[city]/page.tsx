import CityClient from './CityClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type CityPageProps = {
  params: any;
};

export const revalidate = 600;
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const normalizeSlug = (value: string) =>
  decodeURIComponent(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

export async function generateStaticParams() {
  const { data: cities, error } = await supabase.from('cities').select('slug');

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
  const cityParam = Array.isArray(resolvedParams?.city)
    ? resolvedParams.city.join('/')
    : resolvedParams?.city || '';

  const city = normalizeSlug(cityParam);

  if (!city) {
    return <div>City not found.</div>;
  }

  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', city)
    .maybeSingle();

  if (cityError || !cityData) {
    console.error(`City not found: ${city}`);
    return <div>City not found.</div>;
  }

  let streets: any[] = [];

  const { count, error: countError } = await supabase
    .from('streets_with_shops')
    .select('id', { count: 'exact', head: true })
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
  streets = results.flatMap((result) => result.data ?? []);

  const title = `Explore Streets in ${cityData.name} | LocalStreetShop`;
  const description = `Browse streets in ${cityData.name}, Ontario. Discover local businesses, shop small, and explore neighborhoods.`;
  const url = `https://www.localstreetshop.com/cities/${cityData.slug}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <CityClient
        cityName={cityData.name}
        citySlug={cityData.slug}
        streets={streets}
        isKitchenerDemo={false}
      />
    </>
  );
}