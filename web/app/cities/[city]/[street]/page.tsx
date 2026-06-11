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
    return <div>Invalid URL.</div>;
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

  let provinceSlug = 'ontario';
  const provinceData: any = cityData?.province;

  if (Array.isArray(provinceData)) {
    provinceSlug = provinceData[0]?.slug || 'ontario';
  } else if (provinceData && typeof provinceData === 'object') {
    provinceSlug = provinceData.slug || 'ontario';
  }

  const { data: shops, error: shopsError } = await getShopsByStreetId(streetData.id);

  if (shopsError || !shops) {
    console.error('Failed to load shops:', shopsError);
    return <div>No shops found for this street.</div>;
  }

  const streetName = streetData.name;
  const cityName = cityData.name;

  return (
    <>
      <SEO
        title={`${streetName} – Shops in ${cityName} | Local Street Shop`}
        description={`Walk ${streetName} in ${cityName}, ${provinceSlug}, and discover local businesses in address order.`}
        url={`https://www.localstreetshop.com/cities/${city}/${street}`}
      />

      <StreetClient
        province={provinceSlug}
        city={cityData.slug}
        street={streetData.slug}
        streetName={streetName}
        shops={shops}
      />
    </>
  );
}