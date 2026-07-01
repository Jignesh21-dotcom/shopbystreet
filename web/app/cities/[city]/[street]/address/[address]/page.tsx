import Link from 'next/link';
import SEO from '@/app/components/SEO';
import AutoWalkControls from './AutoWalkControls';
import { getStreetBySlug, getShopsForAddressPage } from '@/lib/cacheHelpers';

export const revalidate = 600;

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default async function AddressPage({ params }: any) {
  const awaitedParams = await params;
  const city = normalizeSlug(decodeURIComponent(awaitedParams?.city || ''));
  const street = normalizeSlug(decodeURIComponent(awaitedParams?.street || ''));
  const addressSlug = normalizeSlug(decodeURIComponent(awaitedParams?.address || ''));

  if (!city || !street || !addressSlug) {
    return <div>Invalid address page.</div>;
  }

  let addressBusinesses: any[] = [];
  let streetBusinesses: any[] = [];
  let address = '';
  let streetName = '';
  let cityName = city;
  let provinceSlug = 'ontario';

  const { data: streetData, error: streetError } = await getStreetBySlug(street);

  if (streetError || !streetData) {
    return <div>Street not found.</div>;
  }

  const cityData = Array.isArray(streetData.city)
    ? streetData.city[0]
    : streetData.city;

  if (!cityData || normalizeSlug(cityData.slug) !== city) {
    return <div>Street not found in this city.</div>;
  }

  const provinceData: any = cityData?.province;

  if (Array.isArray(provinceData)) {
    provinceSlug = provinceData[0]?.slug || 'ontario';
  } else if (provinceData && typeof provinceData === 'object') {
    provinceSlug = provinceData.slug || 'ontario';
  }

  const { data: shops, error: shopsError } = await getShopsForAddressPage(streetData.id);

  if (shopsError || !shops) {
    return <div>No businesses found for this address.</div>;
  }

  streetBusinesses = shops.map((shop: any) => ({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    parking: shop.parking,
    category: shop.category,
    phone: shop.phone,
    address: shop.address,
    street_name: streetData.name,
    street_number: shop.street_number,
    image_url: shop.image_url,
  }));

  addressBusinesses = streetBusinesses.filter(
    (shop: any) => shop.address && slugify(shop.address) === addressSlug
  );

  streetName = streetData.name;
  cityName = cityData.name;

  if (addressBusinesses.length === 0) {
    return <div>No businesses found at this address.</div>;
  }

  address = addressBusinesses[0].address;

  const addressStops = Object.values(
    streetBusinesses.reduce((acc: Record<string, any>, biz: any) => {
      if (!biz.address) return acc;

      if (!acc[biz.address]) {
        acc[biz.address] = {
          address: biz.address,
          streetNumber: biz.street_number || 999999,
        };
      }

      return acc;
    }, {})
  ).sort((a: any, b: any) => a.streetNumber - b.streetNumber);

  const currentStopIndex = addressStops.findIndex(
    (stop: any) => slugify(stop.address) === addressSlug
  );

  const previousStop =
    currentStopIndex > 0 ? addressStops[currentStopIndex - 1] : null;

  const nextStop =
    currentStopIndex < addressStops.length - 1
      ? addressStops[currentStopIndex + 1]
      : null;

  const nextStopHref = nextStop
    ? `/cities/${city}/${street}/address/${slugify((nextStop as any).address)}`
    : null;

  const streetHref = `/cities/${city}/${street}`;

  const progressPercent =
    addressStops.length > 0
      ? Math.round(((currentStopIndex + 1) / addressStops.length) * 100)
      : 0;

  const title = `${address} – Businesses on ${streetName}, ${cityName} | LocalStreetShop`;
  const description = `Explore businesses located at ${address} on ${streetName} in ${cityName}.`;
  const url = `https://www.localstreetshop.com/cities/${city}/${street}/address/${addressSlug}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link
            href={streetHref}
            className="inline-block mb-6 text-blue-700 hover:text-blue-900 hover:underline"
          >
            ← Back to full street
          </Link>

          <section className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8">
              <p className="text-sm uppercase tracking-widest opacity-90 mb-3">
                Virtual Street Walk
              </p>

              <h1 className="text-3xl md:text-4xl font-bold">📍 {address}</h1>

              <p className="mt-3 text-lg text-blue-100">
                Stop {currentStopIndex + 1} of {addressStops.length} on{' '}
                {streetName}
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-sm text-blue-100 mb-2">
                  <span>Walk progress</span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <AutoWalkControls
                  nextStopHref={nextStopHref}
                  streetHref={streetHref}
                  isLastStop={!nextStop}
                />
              </div>
            </div>

            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold text-blue-800 mb-5">
                Businesses at this stop
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addressBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/cities/${city}/${street}/${biz.slug}`}
                    className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition overflow-hidden"
                  >
                    {biz.image_url ? (
                      <img
                        src={biz.image_url}
                        alt={`${biz.name} storefront`}
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="h-64 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-gray-500 text-sm font-semibold">
                        🏪 Storefront photo coming soon
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-2xl font-bold text-blue-700">
                        {biz.name}
                      </h3>

                      {biz.category && (
                        <p className="text-sm text-purple-600 font-medium mt-1">
                          {biz.category}
                        </p>
                      )}

                      {biz.phone && (
                        <p className="text-gray-600 mt-3">📞 {biz.phone}</p>
                      )}

                      <p className="mt-4 text-blue-700 font-semibold">
                        View business →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previousStop ? (
                  <Link
                    href={`/cities/${city}/${street}/address/${slugify(
                      (previousStop as any).address
                    )}`}
                    className="rounded-2xl bg-blue-50 hover:bg-blue-100 transition p-5 text-blue-800 font-bold"
                  >
                    ← Previous Stop
                    <p className="text-gray-700 font-normal mt-1">
                      {(previousStop as any).address}
                    </p>
                  </Link>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-5 text-gray-400 font-bold">
                    ← Previous Stop
                    <p className="font-normal mt-1">Start of street</p>
                  </div>
                )}

                <div className="rounded-2xl bg-indigo-50 p-5 text-center">
                  <p className="text-sm text-gray-500">Current Stop</p>
                  <p className="text-xl font-bold text-blue-800">
                    {currentStopIndex + 1} / {addressStops.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {addressBusinesses.length}{' '}
                    {addressBusinesses.length === 1 ? 'business' : 'businesses'}
                  </p>
                </div>

                {nextStop ? (
                  <Link
                    href={nextStopHref || '#'}
                    className="rounded-2xl bg-blue-50 hover:bg-blue-100 transition p-5 text-blue-800 font-bold md:text-right"
                  >
                    Next Stop →
                    <p className="text-gray-700 font-normal mt-1">
                      {(nextStop as any).address}
                    </p>
                  </Link>
                ) : (
                  <div className="rounded-2xl bg-green-50 p-5 text-green-700 font-bold md:text-right">
                    Walk Complete ✅
                    <p className="font-normal mt-1">End of street</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <p className="text-sm font-bold text-gray-600 mb-3">
                Jump to any stop
              </p>

              <div className="flex flex-wrap gap-2">
                {addressStops.map((stop: any) => {
                  const active = slugify(stop.address) === addressSlug;

                  return (
                    <Link
                      key={stop.address}
                      href={`/cities/${city}/${street}/address/${slugify(
                        stop.address
                      )}`}
                      className={`px-3 py-2 rounded-full text-sm font-semibold transition ${
                        active
                          ? 'bg-blue-700 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                      }`}
                    >
                      {stop.address}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-5">
              Phone Directory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addressBusinesses
                .filter((biz) => biz.phone)
                .map((biz) => (
                  <div
                    key={biz.id}
                    className="rounded-2xl bg-gray-50 border border-gray-100 p-5"
                  >
                    <p className="font-bold text-blue-700">{biz.name}</p>
                    <a
                      href={`tel:${biz.phone}`}
                      className="text-gray-700 hover:text-blue-700 hover:underline"
                    >
                      📞 {biz.phone}
                    </a>
                  </div>
                ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Map & Directions
            </h2>

            <div className="overflow-hidden rounded-2xl mb-5 border">
              <iframe
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${address}, ${cityName}, ${provinceSlug}`
                )}&output=embed`}
              />
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${address}, ${cityName}, ${provinceSlug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
            >
              Open in Google Maps
            </a>
          </section>
        </div>
      </main>
    </>
  );
}