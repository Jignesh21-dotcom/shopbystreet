import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

// Add normalization function here
const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

type StreetPageProps = {
  params: {
    city?: string;
    street?: string;
  };
};

export default async function StreetPage({ params }: any) {
  // Use normalization for params
  const city = normalizeSlug(decodeURIComponent(params?.city || ''));
  const street = normalizeSlug(decodeURIComponent(params?.street || ''));

  if (!city || !street) {
    console.error('Missing city or street param:', { city, street });
    return <div>Invalid URL.</div>;
  }

  // Fetch street data (with city relation, and province via join)
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      slug,
      city:city_id (
        name,
        slug,
        province:province_id (
          slug
        )
      )
    `)
    .eq('slug', street)
    .single();

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`, streetError);
    return <div>Street not found.</div>;
  }

  // Normalize city relation (handle array/object)
  const cityData = Array.isArray(streetData.city) ? streetData.city[0] : streetData.city;

  // Use normalization for city slug comparison
  if (!cityData || normalizeSlug(cityData.slug) !== city) {
    console.error(
      `Validation failed: Street "${street}" does not belong to city "${city}".`,
      { streetCitySlug: cityData?.slug, citySlug: city }
    );
    return <div>Street not found in this city.</div>;
  }

 // Province slug from join, fallback to 'ontario'
let provinceSlug = 'ontario';
const provinceData: any = cityData?.province;

if (Array.isArray(provinceData)) {
  provinceSlug = provinceData[0]?.slug || 'ontario';
} else if (provinceData && typeof provinceData === 'object') {
  provinceSlug = provinceData.slug || 'ontario';
}

  // Fetch shops using street_id (relational, robust)
  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select('id, name, slug, description, parking')
    .eq('street_id', streetData.id)
    .order('sequence', { ascending: true });

  console.log('Fetched shops:', shops);

  if (shopsError || !shops) {
    console.error(`Failed to load shops for street: ${street}`, shopsError);
    return <div>No shops found for this street.</div>;
  }

  // SEO values
  const streetName = streetData.name;
  const cityName = cityData.name;
  const title = `${streetName} – Shops in ${cityName} | Local Street Shop`;
  const description = `Discover local businesses on ${streetName} in ${cityName}, ${provinceSlug}. Explore stores, products, and support your local economy.`;
  const url = `https://www.localstreetshop.com/cities/${city}/${street}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
      <StreetClient
        province={provinceSlug}
        city={cityData.slug}
        street={streetData.slug}
        shops={shops}
      />
    </>
  );
}