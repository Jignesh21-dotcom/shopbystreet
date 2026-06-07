import StreetClient from './StreetClient';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default async function StreetPage({ params }: any) {
  const awaitedParams = await params;
  const city = normalizeSlug(decodeURIComponent(awaitedParams?.city || ''));
  const street = normalizeSlug(decodeURIComponent(awaitedParams?.street || ''));

  if (!city || !street) {
    return <div>Invalid URL.</div>;
  }

  const isKitchenerDemo = city === 'kitchener';

  if (isKitchenerDemo) {
    const { data: businesses, error } = await supabase
      .from('downtown_kitchener_businesses')
      .select(
        'id, business_name, category, phone, address, street_name, street_number'
      )
      .order('street_number', { ascending: true });

    if (error || !businesses) {
      console.error('Failed to load Downtown Kitchener businesses:', error);
      return <div>No businesses found for this street.</div>;
    }

    const streetBusinesses = businesses.filter(
      (biz) => biz.street_name && slugify(biz.street_name) === street
    );

    if (streetBusinesses.length === 0) {
      return <div>No businesses found for this street.</div>;
    }

    const streetName = streetBusinesses[0].street_name;

    const shops = streetBusinesses.map((biz) => ({
      id: biz.id,
      name: biz.business_name,
      slug: slugify(biz.business_name),
      description: biz.category,
      parking: biz.phone || '',
      address: biz.address,
      category: biz.category,
      phone: biz.phone,
      street_number: biz.street_number,
    }));

    return (
      <>
        <SEO
          title={`${streetName} – Downtown Kitchener Businesses | Local Street Shop`}
          description={`Walk ${streetName} in Downtown Kitchener and discover local businesses in address order.`}
          url={`https://www.localstreetshop.com/cities/kitchener/${street}`}
        />
        <StreetClient
          province="ontario"
          city="kitchener"
          street={street}
          streetName={streetName}
          shops={shops}
          isKitchenerDemo={true}
        />
      </>
    );
  }

  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      slug,
      city:city_id (
        name,
        slug,
        province:province_id (
          slug
        )
      )
    `)
    .eq('slug', street)
    .single();

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

  const { data: shops, error: shopsError } = await supabase
    .from('shops')
    .select(
      'id, name, slug, description, parking, address, category, phone, street_number'
    )
    .eq('street_id', streetData.id)
    .order('street_number', { ascending: true });

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