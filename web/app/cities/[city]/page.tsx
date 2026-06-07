import CityClient from './CityClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type CityPageProps = {
  params: any;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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
  const city = resolvedParams.city;

  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', city.toLowerCase())
    .single();

  if (cityError || !cityData) {
    console.error(`City not found: ${city}`);
    return <div>City not found.</div>;
  }

  const isKitchener = cityData.slug.toLowerCase() === 'kitchener';

  let streets: any[] = [];

  if (isKitchener) {
    const { data: demoBusinesses, error: demoError } = await supabase
      .from('downtown_kitchener_businesses')
      .select('business_name, street_name, street_number, category, address')
      .order('street_name', { ascending: true })
      .order('street_number', { ascending: true });

    if (demoError) {
      console.error('Failed to load Downtown Kitchener businesses:', demoError);
    }

    const streetMap = new Map<string, any>();

    (demoBusinesses ?? []).forEach((biz) => {
      if (!biz.street_name) return;

      const key = biz.street_name;

      if (!streetMap.has(key)) {
        streetMap.set(key, {
          name: biz.street_name,
          slug: slugify(biz.street_name),
          shop_count: 0,
          featured_business: biz.business_name,
        });
      }

      const street = streetMap.get(key);
      street.shop_count += 1;
    });

    streets = Array.from(streetMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  } else {
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
    streets = results.flatMap((result) => result.data ?? []);
  }

  const title = `Explore Streets in ${cityData.name} | Local Street Shop`;
  const description = `Browse streets in ${cityData.name}, Ontario. Discover local businesses, shop small, and explore neighborhoods.`;
  const url = `https://www.localstreetshop.com/cities/${cityData.slug}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
      <CityClient
        cityName={cityData.name}
        citySlug={cityData.slug}
        streets={streets}
        isKitchenerDemo={isKitchener}
      />
    </>
  );
}