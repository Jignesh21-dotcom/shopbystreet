import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';

type ShopPageProps = {
  params: {
    city: string;
    street: string;
    shop: string;
  };
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

  // Validate that the shop belongs to the correct street and city
  if (
    shopData.street?.slug !== street ||
    shopData.street?.city?.slug !== city
  ) {
    console.error(
      `Shop does not belong to the specified city (${city}) or street (${street}).`,
      { shopStreetSlug: shopData.street?.slug, shopCitySlug: shopData.street?.city?.slug }
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