import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type ShopPageProps = {
  params: any;
};

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default async function ShopPage({ params }: ShopPageProps) {
  const awaitedParams = await params;
  const rawCity = normalizeSlug(decodeURIComponent(awaitedParams.city || ''));
  const rawStreet = normalizeSlug(decodeURIComponent(awaitedParams.street || ''));
  const rawShop = normalizeSlug(decodeURIComponent(awaitedParams.shop || ''));

  if (!rawCity || !rawStreet || !rawShop) {
    return <div>Invalid URL.</div>;
  }

  const isKitchenerDemo = rawCity === 'kitchener';

  let business: any = null;
  let streetBusinesses: any[] = [];
  let streetName = '';
  let cityName = rawCity;
  let provinceSlug = 'ontario';

  if (isKitchenerDemo) {
    const { data: businesses, error } = await supabase
      .from('downtown_kitchener_businesses')
      .select(
        'id, business_name, category, phone, address, street_name, street_number'
      )
      .order('street_number', { ascending: true });

    if (error || !businesses) {
      return <div>Business not found.</div>;
    }

    streetBusinesses = businesses
      .filter((biz) => biz.street_name && slugify(biz.street_name) === rawStreet)
      .map((biz) => ({
        id: biz.id,
        name: biz.business_name,
        slug: slugify(biz.business_name),
        category: biz.category,
        phone: biz.phone,
        address: biz.address,
        street_name: biz.street_name,
        street_number: biz.street_number,
        description: '',
        parking: '',
        image_url: '',
        story: '',
        hours: '',
        contact: '',
        owner_id: null,
      }));

    business = streetBusinesses.find((biz) => biz.slug === rawShop);
    streetName = business?.street_name || '';
    cityName = 'Kitchener';
  } else {
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
      .eq('slug', rawStreet)
      .single();

    if (streetError || !streetData) {
      return <div>🚫 Shop not found or mismatched street/city.</div>;
    }

    const cityData = Array.isArray(streetData.city)
      ? streetData.city[0]
      : streetData.city;

    if (!cityData || normalizeSlug(cityData.slug) !== rawCity) {
      return <div>🚫 Shop not found or mismatched street/city.</div>;
    }

    const provinceData: any = cityData?.province;

    if (Array.isArray(provinceData)) {
      provinceSlug = provinceData[0]?.slug || 'ontario';
    } else if (provinceData && typeof provinceData === 'object') {
      provinceSlug = provinceData.slug || 'ontario';
    }

    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select(
        'id, name, slug, owner_id, description, parking, image_url, story, hours, contact, address, category, phone, street_number'
      )
      .eq('street_id', streetData.id)
      .eq('approved', true)
      .order('street_number', { ascending: true });

    if (shopsError || !shops) {
      return <div>🚫 Shop not found or mismatched street/city.</div>;
    }

    streetBusinesses = shops.map((shop) => ({
      ...shop,
      street_name: streetData.name,
    }));

    business = streetBusinesses.find((shop) => shop.slug === rawShop);

    streetName = streetData.name;
    cityName = cityData.name;
  }

  if (!business) {
    return <div>Business not found.</div>;
  }

  const isClaimed = Boolean(business.owner_id);

  const nearbyBusinesses = streetBusinesses.filter(
    (biz) =>
      biz.address &&
      business.address &&
      biz.address === business.address &&
      biz.id !== business.id
  );

  const otherStreetBusinesses = streetBusinesses
    .filter((biz) => biz.id !== business.id)
    .slice(0, 8);

  const addressHref = business.address
    ? `/cities/${rawCity}/${rawStreet}/address/${slugify(business.address)}`
    : `/cities/${rawCity}/${rawStreet}`;

  const claimHref = `/shop-owner/claim`;

  const mapQuery = `${business.name}, ${
    business.address || streetName
  }, ${cityName}, ${provinceSlug}`;

  const title = `${business.name} – ${streetName}, ${cityName} | Local Street Shop`;
  const description = business.description
    ? `${business.name} - ${business.description}`
    : `View ${business.name} on ${streetName} in ${cityName}.`;
  const url = `https://www.localstreetshop.com/cities/${rawCity}/${rawStreet}/${rawShop}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link
            href={`/cities/${rawCity}/${rawStreet}`}
            className="inline-block mb-6 text-blue-700 hover:text-blue-900 hover:underline"
          >
            ← Back to street
          </Link>

          <nav className="mb-6 text-sm text-gray-600">
            <Link
              href={`/cities/${rawCity}`}
              className="hover:text-blue-700 hover:underline capitalize"
            >
              {cityName}
            </Link>
            <span className="mx-2">›</span>

            <Link
              href={`/cities/${rawCity}/${rawStreet}`}
              className="hover:text-blue-700 hover:underline"
            >
              {streetName}
            </Link>

            {business.address && (
              <>
                <span className="mx-2">›</span>
                <Link
                  href={addressHref}
                  className="hover:text-blue-700 hover:underline"
                >
                  {business.address}
                </Link>
              </>
            )}

            <span className="mx-2">›</span>
            <span className="font-semibold text-gray-800">{business.name}</span>
          </nav>

          <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-10">
              <p className="text-sm uppercase tracking-widest opacity-90 mb-3">
                Local Business
              </p>

              <h1 className="text-4xl md:text-5xl font-bold">
                {business.name}
              </h1>

              {business.category && (
                <p className="mt-4 text-xl text-blue-100">
                  {business.category}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href={`/shops/${business.slug}/products`}
                  className="bg-white text-blue-700 px-5 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
                >
                  🛍 View Products
                </Link>

                {business.address && (
                  <Link
                    href={addressHref}
                    className="bg-white/15 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/25 transition"
                  >
                    🚶 View this street stop
                  </Link>
                )}

                {!isClaimed && (
                  <Link
                    href={claimHref}
                    className="bg-yellow-400 text-gray-900 px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition"
                  >
                    🏪 Claim This Business
                  </Link>
                )}
              </div>
            </div>

            {!isClaimed && (
              <div className="bg-yellow-50 border-b border-yellow-100 px-8 py-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-bold text-yellow-800">
                      Own this business?
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Claim this listing to add products, photos, hours, contact
                      details, and improve your visibility on Local Street Shop.
                    </p>
                  </div>

                  <Link
                    href={claimHref}
                    className="inline-block bg-yellow-400 text-gray-900 px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition text-center"
                  >
                    Claim This Business →
                  </Link>
                </div>
              </div>
            )}

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-blue-50 p-6">
                <p className="text-sm font-bold text-blue-700 mb-2">Address</p>
                <p className="text-gray-700">
                  {business.address || business.description || 'Not available'}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-6">
                <p className="text-sm font-bold text-purple-700 mb-2">Phone</p>

                {business.phone || business.contact ? (
                  <a
                    href={`tel:${business.phone || business.contact}`}
                    className="text-gray-700 hover:text-blue-700 hover:underline"
                  >
                    {business.phone || business.contact}
                  </a>
                ) : (
                  <p className="text-gray-700">Not available</p>
                )}
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <p className="text-sm font-bold text-green-700 mb-2">
                  Category
                </p>
                <p className="text-gray-700">
                  {business.category || 'Not available'}
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-6">
                <p className="text-sm font-bold text-yellow-700 mb-2">
                  Parking
                </p>
                <p className="text-gray-700">
                  {business.parking || 'Not available'}
                </p>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="rounded-2xl bg-gray-50 p-6">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Description
                </p>
                <p className="text-gray-600">
                  {business.story ||
                    business.description ||
                    'Business description will be added soon.'}
                </p>
              </div>
            </div>

            {(business.hours || business.contact) && (
              <div className="px-8 pb-8">
                <div className="rounded-2xl bg-gray-50 p-6">
                  <p className="text-sm font-bold text-gray-700 mb-4">
                    Contact & Hours
                  </p>

                  <p className="text-gray-700">
                    <strong>Hours:</strong>{' '}
                    {business.hours || 'Hours not available'}
                  </p>

                  <p className="text-gray-700 mt-2">
                    <strong>Contact:</strong>{' '}
                    {business.contact ||
                      business.phone ||
                      'Contact not available'}
                  </p>
                </div>
              </div>
            )}

            {business.image_url && (
              <div className="px-8 pb-8">
                <img
                  src={business.image_url}
                  alt={business.name}
                  className="w-full rounded-2xl shadow-md"
                />
              </div>
            )}

            <div className="px-8 pb-8">
              <div className="rounded-2xl bg-gray-50 p-6">
                <p className="text-sm font-bold text-gray-700 mb-4">
                  Map & Directions
                </p>

                <div className="overflow-hidden rounded-2xl mb-5 border">
                  <iframe
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      mapQuery
                    )}&output=embed`}
                  />
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </section>

          {nearbyBusinesses.length > 0 && (
            <section className="bg-white rounded-3xl shadow-md p-8 mt-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                Nearby businesses at same address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyBusinesses.map((nearby) => (
                  <Link
                    key={nearby.id}
                    href={`/cities/${rawCity}/${rawStreet}/${nearby.slug}`}
                    className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition p-5"
                  >
                    <h3 className="text-lg font-bold text-blue-700">
                      {nearby.name}
                    </h3>

                    {nearby.category && (
                      <p className="text-sm text-purple-600 mt-1">
                        {nearby.category}
                      </p>
                    )}

                    {nearby.phone && (
                      <p className="text-gray-600 mt-3">📞 {nearby.phone}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white rounded-3xl shadow-md p-8 mt-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Explore {streetName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherStreetBusinesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/cities/${rawCity}/${rawStreet}/${biz.slug}`}
                  className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition p-5"
                >
                  <h3 className="font-bold text-blue-700">{biz.name}</h3>

                  {biz.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {biz.address}
                    </p>
                  )}

                  {biz.category && (
                    <p className="text-sm text-purple-600 mt-2">
                      {biz.category}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}