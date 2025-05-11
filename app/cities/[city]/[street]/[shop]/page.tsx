import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { city, street, shop } = params;

  // Fetch shop data (without .single() for more flexibility and debugging)
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
    .eq('slug', shop);

  if (shopError) {
    console.error(`Supabase error while fetching shop:`, shopError);
    return <div>⚠️ Error loading shop. Please try again later.</div>;
  }

  if (!shopData || shopData.length === 0) {
    console.error(`No shop found for slug:`, shop);
    return <div>🛍️ Shop not found.</div>;
  }

  const shopRecord = shopData[0];

  // Safely unwrap nested objects
  const streetData = Array.isArray(shopRecord.street) ? shopRecord.street[0] : shopRecord.street;
  const cityData = Array.isArray(streetData?.city) ? streetData.city[0] : streetData?.city;

  // Log for debugging
  console.log('✅ Fetched shopRecord:', shopRecord);
  console.log('📍 Street data:', streetData);
  console.log('🏙️ City data:', cityData);

  // Validate that the shop belongs to the correct street and city
  const normalizedStreet = decodeURIComponent(street).toLowerCase();
const normalizedCity = decodeURIComponent(city).toLowerCase();

if (
  !streetData || streetData.slug.toLowerCase() !== normalizedStreet ||
  !cityData || cityData.slug.toLowerCase() !== normalizedCity
) {

    console.error(`Shop mismatch`, {
      expectedStreet: street,
      actualStreet: streetData?.slug,
      expectedCity: city,
      actualCity: cityData?.slug,
    });
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

  return (
    <ShopPageClient
      city={city}
      street={street}
      shop={shop}
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