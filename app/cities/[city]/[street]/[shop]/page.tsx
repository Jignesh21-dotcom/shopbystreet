import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { city, street, shop } = params;

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
    .eq('slug', shop)
    .single();

  if (shopError || !shopData) {
    console.error(`Shop not found: ${shop}`, shopError);
    return <div>Shop not found.</div>;
  }

  // Log the fetched data for debugging
  console.log('Fetched shopData:', shopData);

  // Ensure `street` and `city` are single objects, not arrays
  const streetData = Array.isArray(shopData.street) ? shopData.street[0] : shopData.street;
  const cityData = Array.isArray(streetData?.city) ? streetData.city[0] : streetData?.city;

  // Log the street and city data for debugging
  console.log('Street data:', streetData);
  console.log('City data:', cityData);

  // Validate that the shop belongs to the correct street and city
  if (!streetData || streetData.slug !== street || !cityData || cityData.slug !== city) {
    console.error(
      `Shop does not belong to the specified city (${city}) or street (${street}).`,
      { shopStreetSlug: streetData?.slug, shopCitySlug: cityData?.slug }
    );
    return <div>Shop not found or mismatched.</div>;
  }

  // Pass the fetched data to the client component
  return (
    <ShopPageClient
      city={city}
      street={street}
      shop={shop}
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