import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/components/SEO';

type ShopPageProps = {
  params: any;
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

  // 🧠 SEO content
  const title = `${shopData.name} | ${rawStreet.replace(/-/g, ' ')} | Local Street Shop`;
  const description = shopData.description
    ? `${shopData.name} - ${shopData.description}`
    : `Visit ${shopData.name} located on ${rawStreet.replace(/-/g, ' ')} in ${rawCity}. Support local shopping.`;
  const url = `https://www.localstreetshop.com/cities/${rawCity}/${rawStreet}/${rawShop}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
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
    </>
  );
}
