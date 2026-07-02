import StreetClient from './StreetClient';
import SEO from '@/app/components/SEO';
import { getStreetBySlug, getShopsByStreetId } from '@/lib/cacheHelpers';

export const revalidate = 600;

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

export default async function StreetPage({ params }: any) {
  const awaitedParams = await params;

  const city = normalizeSlug(decodeURIComponent(awaitedParams?.city || ''));
  const street = normalizeSlug(decodeURIComponent(awaitedParams?.street || ''));

  if (!city || !street) {
    return <div>Invalid street URL.</div>;
  }

  const { data: streetData, error: streetError } = await getStreetBySlug(street);

  if (streetError || !streetData) {
    console.error(`Street not found: ${street}`, streetError);
    return <div>Street not found.</div>;
  }

  const cityData = Array.isArray(streetData.city)
    ? streetData.city[0]
    : streetData.city;

  if (!cityData || normalizeSlug(cityData.slug) !== city) {
    return <div>Street not found in this city.</div>;
  }

  const provinceData: any = Array.isArray(cityData?.province)
    ? cityData.province[0]
    : cityData?.province;

  const provinceSlug = provinceData?.slug || 'ontario';
  const provinceName = provinceData?.name || 'Ontario';

  const { data: shops, error: shopsError } = await getShopsByStreetId(streetData.id);

  if (shopsError) {
    console.error('Failed to load shops:', shopsError);
    return <div>Unable to load shops for this street.</div>;
  }

  const streetName = streetData.name;
  const cityName = cityData.name;

  return (
    <>
      <SEO
        title={`${streetName} Shops in ${cityName} | LocalStreetShop`}
        description={`Explore local shops, restaurants, services, and businesses on ${streetName} in ${cityName}, ${provinceName}. Walk the street online and discover what is nearby.`}
        url={`https://www.localstreetshop.com/cities/${city}/${street}`}
      />

      <StreetClient
        province={provinceSlug}
        city={cityData.slug}
        street={streetData.slug}
        streetName={streetName}
        shops={shops || []}
      />
    </>
  );
}