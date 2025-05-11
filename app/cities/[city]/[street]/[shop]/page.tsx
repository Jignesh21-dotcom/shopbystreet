import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function ShopPage({ params }: ShopPageProps) {
  // Decode and normalize route slugs
  const slugify = (str: string) =>
  decodeURIComponent(str).toLowerCase().replace(/\s+/g, '-');

const rawCity = decodeURIComponent(params.city).toLowerCase();
const rawStreet = decodeURIComponent(params.street).toLowerCase();
const rawShop = decodeURIComponent(params.shop).toLowerCase();



  // Fetch shop data
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
    .eq('slug', rawShop);

  if (shopError) {
    console.error(`Supabase error while fetching shop:`, shopError);
    return <div>⚠️ Error loading shop. Please try again later.</div>;
  }

  if (!shopData || shopData.length === 0) {
    console.error(`No shop found for slug:`, rawShop);
    return <div>🛍️ Shop not found.</div>;
  }

  const shopRecord = shopData[0];

  // Safely unwrap nested data
  const streetData = Array.isArray(shopRecord.street) ? shopRecord.street[0] : shopRecord.street;
  const cityData = Array.isArray(streetData?.city) ? streetData.city[0] : streetData?.city;

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

  return (
    <ShopPageClient
      city={rawCity}
      street={rawStreet}
      shop={rawShop}
      shopData={{
        name: shopRecord.name,
        description: shopRecord.description,
        parking: shopRecord.parking,
        image_url: shopRecord.image_url,
        story: shopRecord.story,
      }}
    />
  );
}