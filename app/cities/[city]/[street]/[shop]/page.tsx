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
  const rawCity = decodeURIComponent(params.city).toLowerCase().trim();
  const rawStreet = decodeURIComponent(params.street).toLowerCase().trim();
  const rawShop = decodeURIComponent(params.shop).toLowerCase().trim();

  // Step 1: Fetch the shop
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', rawShop)
    .eq('streetSlug', rawStreet)
    .eq('approved', true)
    .single();

  if (shopError || !shopData) {
    console.error('❌ Shop fetch error:', shopError);
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

  // Step 2: Fetch the matching street
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select('slug, city')
    .eq('slug', rawStreet)
    .single();

  const dbStreetSlug = streetData?.slug?.toLowerCase().trim() || '';
  const dbCitySlug = streetData?.city?.toLowerCase().trim() || '';

  console.log('🛠️ Comparing shop location slugs:', {
    dbStreetSlug,
    dbCitySlug,
    rawStreet,
    rawCity,
    matchStreet: dbStreetSlug === rawStreet,
    matchCity: dbCitySlug === rawCity,
  });

  if (dbStreetSlug !== rawStreet || dbCitySlug !== rawCity) {
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

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
