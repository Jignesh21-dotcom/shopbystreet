import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function ShopPage({ params }: ShopPageProps) {
  // Validate and destructure `params`
  const city = params?.city || '';
  const street = params?.street || '';
  const shop = params?.shop || '';

  // Decode and normalize route slugs
  const rawCity = decodeURIComponent(city).toLowerCase();
  const rawStreet = decodeURIComponent(street).toLowerCase();
  const rawShop = decodeURIComponent(shop).toLowerCase();

  // Fetch shop data with explicit joins for street and city
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      slug,
      description,
      parking,
      image_url,
      story,
      street:street_id (
        slug,
        city:city_id (
          slug
        )
      )
    `)
    .eq('slug', rawShop)
    .single(); // Ensure we fetch a single shop record

  if (shopError) {
    console.error(`Supabase error while fetching shop:`, shopError);
    return <div>⚠️ Error loading shop. Please try again later.</div>;
  }

  if (!shopData) {
    console.error(`No shop found for slug:`, rawShop);
    return <div>🛍️ Shop not found.</div>;
  }

  // Safely unwrap nested data
  const streetData = shopData.street || {};
  const cityData = streetData.city || {};

  const dbStreetSlug = streetData?.slug?.toLowerCase() || '';
  const dbCitySlug = cityData?.slug?.toLowerCase() || '';

  console.log('✅ Shop match debug:', {
    expectedStreet: rawStreet,
    actualStreet: dbStreetSlug,
    expectedCity: rawCity,
    actualCity: dbCitySlug,
  });

  // Validate match
  if (dbStreetSlug !== rawStreet || dbCitySlug !== rawCity) {
    console.error('❌ Shop mismatch', {
      expectedStreet: rawStreet,
      actualStreet: dbStreetSlug,
      expectedCity: rawCity,
      actualCity: dbCitySlug,
    });
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

  // Pass the fetched data to the client component
  return (
    <ShopPageClient
      city={rawCity}
      street={rawStreet}
      shop={rawShop}
      shopData={{
        name: shopData.name,
        description: shopData.description,
        parking: shopData.parking,
        image_url: shopData.image_url,
        story: shopData.story,
      }}
    />
  );
}