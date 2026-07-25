import Link from 'next/link';
import SEO from '@/app/components/SEO';
import { getStreetBySlug, getShopsDetailByStreetId } from '@/lib/cacheHelpers';

export const revalidate = 600;

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

  let business: any = null;
  let streetBusinesses: any[] = [];
  let streetName = '';
  let cityName = rawCity;
  let provinceSlug = 'ontario';

  const { data: streetData, error: streetError } = await getStreetBySlug(rawStreet);

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

  const { data: shops, error: shopsError } = await getShopsDetailByStreetId(streetData.id);

  if (shopsError || !shops) {
    return <div>🚫 Shop not found or mismatched street/city.</div>;
  }

  streetBusinesses = shops.map((shop: any) => ({
    ...shop,
    street_name: streetData.name,
  }));

  business = streetBusinesses.find((shop: any) => shop.slug === rawShop);

  streetName = streetData.name;
  cityName = cityData.name;

  if (!business) {
    return <div>Business not found.</div>;
  }

  const isClaimed = Boolean(business.owner_id);

  const nearbyBusinesses = streetBusinesses.filter(
    (biz: any) =>
      biz.address &&
      business.address &&
      biz.address === business.address &&
      biz.id !== business.id
  );

  const otherStreetBusinesses = streetBusinesses
    .filter((biz: any) => biz.id !== business.id)
    .slice(0, 8);

  const addressHref = business.address
    ? `/cities/${rawCity}/${rawStreet}/address/${slugify(business.address)}`
    : `/cities/${rawCity}/${rawStreet}`;

  const claimHref = `/shop-owner/claim?shopId=${business.id}`;

  const mapQuery = `${business.name}, ${
    business.address || streetName
  }, ${cityName}, ${provinceSlug}`;

  const title = `${business.name} – ${streetName}, ${cityName} | LocalStreetShop`;

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

          <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {business.image_url && (
              <div className="w-full bg-gray-100">
                <img
                  src={business.image_url}
                  alt={`${business.name} storefront`}
                  className="h-80 w-full object-cover"
                />
              </div>
            )}

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
                  href={`/cities/${rawCity}/${rawStreet}/${business.slug}/products`}
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

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard title="Address" color="blue">
                {business.address || 'Not available'}
              </InfoCard>

              <InfoCard title="Phone" color="purple">
                {business.phone || business.contact ? (
                  <a
                    href={`tel:${business.phone || business.contact}`}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {business.phone || business.contact}
                  </a>
                ) : (
                  'Not available'
                )}
              </InfoCard>

              <InfoCard title="Category" color="green">
                {business.category || 'Not available'}
              </InfoCard>

              <InfoCard title="Parking" color="yellow">
                {business.parking || 'Not available'}
              </InfoCard>
            </div>

            {(business.description || business.story) && (
              <div className="px-8 pb-8 space-y-6">
                {business.description && (
                  <div className="rounded-2xl bg-gray-50 p-6">
                    <p className="text-sm font-bold text-gray-700 mb-2">
                      Description
                    </p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {business.description}
                    </p>
                  </div>
                )}

                {business.story && (
                  <div className="rounded-2xl bg-orange-50 p-6">
                    <p className="text-sm font-bold text-orange-700 mb-2">
                      Our Story
                    </p>
                    <p className="text-gray-700 whitespace-pre-line">
                      {business.story}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(business.hours ||
              business.email ||
              business.website ||
              business.instagram ||
              business.facebook) && (
              <div className="px-8 pb-8">
                <div className="rounded-2xl bg-gray-50 p-6">
                  <p className="text-sm font-bold text-gray-700 mb-4">
                    Contact & Hours
                  </p>

                  {business.hours && (
                    <p className="text-gray-700 whitespace-pre-line mb-3">
                      <strong>Hours:</strong>
                      <br />
                      {business.hours}
                    </p>
                  )}

                  {business.email && (
                    <p className="text-gray-700 mt-2">
                      <strong>Email:</strong>{' '}
                      <a
                        href={`mailto:${business.email}`}
                        className="text-blue-700 hover:underline"
                      >
                        {business.email}
                      </a>
                    </p>
                  )}

                  {business.website && (
                    <p className="text-gray-700 mt-2">
                      <strong>Website:</strong>{' '}
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        Visit Website
                      </a>
                    </p>
                  )}

                  {business.instagram && (
                    <p className="text-gray-700 mt-2">
                      <strong>Instagram:</strong>{' '}
                      <a
                        href={business.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        View Instagram
                      </a>
                    </p>
                  )}

                  {business.facebook && (
                    <p className="text-gray-700 mt-2">
                      <strong>Facebook:</strong>{' '}
                      <a
                        href={business.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        View Facebook
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isClaimed && (
              <div className="bg-yellow-50 border-y border-yellow-100 px-8 py-5">
                <p className="font-bold text-yellow-800">Own this business?</p>
                <p className="text-sm text-gray-700 mt-1">
                  Claim this listing to add products, photos, hours, contact
                  details, and improve your visibility on LocalStreetShop.
                </p>

                <Link
                  href={claimHref}
                  className="inline-block mt-4 bg-yellow-400 text-gray-900 px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition"
                >
                  Claim This Business →
                </Link>
              </div>
            )}

            <div className="px-8 py-8">
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
                    className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition overflow-hidden"
                  >
                    {nearby.image_url && (
                      <img
                        src={nearby.image_url}
                        alt={nearby.name}
                        className="h-36 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
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
                    </div>
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
                  className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition overflow-hidden"
                >
                  {biz.image_url && (
                    <img
                      src={biz.image_url}
                      alt={biz.name}
                      className="h-36 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
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
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function InfoCard({
  title,
  color,
  children,
}: {
  title: string;
  color: 'blue' | 'purple' | 'green' | 'yellow';
  children: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className={`rounded-2xl p-6 ${colorClasses[color].split(' ')[0]}`}>
      <p className={`text-sm font-bold mb-2 ${colorClasses[color].split(' ')[1]}`}>
        {title}
      </p>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}