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

  // Fetch shop data and validate city and street
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select(
      `
      *,
      street:street_id (
        slug,
        city:city_id (
          slug
        )
      )
    `
    )
    .eq('slug', shop)
    .single();

  if (shopError || !shopData) {
    console.error(`Shop not found: ${shop}`);
    return <div>Shop not found.</div>;
  }

  // Validate that the shop belongs to the correct street and city
  if (
    shopData.street?.slug !== street ||
    shopData.street?.city?.slug !== city
  ) {
    console.error(
      `Shop does not belong to the specified city (${city}) or street (${street}).`
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