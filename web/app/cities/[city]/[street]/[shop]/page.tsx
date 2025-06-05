import ShopPageClient from './ShopPageClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type ShopPageProps = {
  params: any;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const rawCity = decodeURIComponent(params.city).toLowerCase().trim();
  const rawStreet = decodeURIComponent(params.street).toLowerCase().trim();
  const rawShop = decodeURIComponent(params.shop).toLowerCase().trim();

  // Step 1: Fetch the street (with city relation)
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      slug,
      city:city_id (
        slug
      )
    `)
    .eq('slug', rawStreet)
    .single();

  if (streetError || !streetData) {
    console.error('❌ Street fetch error:', streetError);
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

  /// Normalize city to object (not array)
let cityDataRaw = streetData.city;
let cityData: { slug?: string } | undefined;
if (Array.isArray(cityDataRaw)) {
  cityData = cityDataRaw[0];
} else {
  cityData = cityDataRaw;
}
const dbCitySlug = cityData?.slug?.toLowerCase().trim() || '';
const dbStreetSlug = streetData.slug?.toLowerCase().trim() || '';

  // Step 2: Fetch the shop using street_id and slug
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select('name, description, parking, image_url, story')
    .eq('slug', rawShop)
    .eq('street_id', streetData.id)
    .eq('approved', true)
    .single();

  if (shopError || !shopData) {
    console.error('❌ Shop fetch error:', shopError);
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