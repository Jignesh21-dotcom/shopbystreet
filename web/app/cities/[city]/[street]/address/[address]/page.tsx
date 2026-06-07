import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';
import AutoWalkControls from './AutoWalkControls';

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default async function AddressPage({ params }: any) {
  const city = normalizeSlug(decodeURIComponent(params?.city || ''));
  const street = normalizeSlug(decodeURIComponent(params?.street || ''));
  const addressSlug = normalizeSlug(decodeURIComponent(params?.address || ''));

  if (!city || !street || !addressSlug) {
    return <div>Invalid address page.</div>;
  }

  const isKitchenerDemo = city === 'kitchener';

  let addressBusinesses: any[] = [];
  let streetBusinesses: any[] = [];
  let address = '';
  let streetName = '';
  let cityName = city;
  let provinceSlug = 'ontario';

  if (isKitchenerDemo) {
    const { data: businesses, error } = await supabase
      .from('downtown_kitchener_businesses')
      .select(
        'id, business_name, category, phone, address, street_name, street_number'
      )
      .order('street_number', { ascending: true });

    if (error || !businesses) {
      return <div>Address not found.</div>;
    }

    streetBusinesses = businesses
      .filter((biz) => biz.street_name && slugify(biz.street_name) === street)
      .map((biz) => ({
        id: biz.id,
        name: biz.business_name,
        slug: slugify(biz.business_name),
        category: biz.category,
        phone: biz.phone,
        address: biz.address,
        street_name: biz.street_name,
        street_number: biz.street_number,
      }));

    addressBusinesses = streetBusinesses.filter(
      (biz) => biz.address && slugify(biz.address) === addressSlug
    );

    streetName = addressBusinesses[0]?.street_name || '';
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
      .eq('slug', street)
      .single();

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

    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select(
        'id, name, slug, description, parking, address, category, phone, street_number'
      )
      .eq('street_id', streetData.id)
      .order('street_number', { ascending: true });

    if (shopsError || !shops) {
      return <div>No businesses found for this address.</div>;
    }

    streetBusinesses = shops.map((shop) => ({
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
    }));

    addressBusinesses = streetBusinesses.filter(
      (shop) => shop.address && slugify(shop.address) === addressSlug
    );

    streetName = streetData.name;
    cityName = cityData.name;
  }

  if (addressBusinesses.length === 0) {
    return <div>No businesses found at this address.</div>;
  }

  address = addressBusinesses[0].address;

  const addressStops = Object.values(
    streetBusinesses.reduce((acc: Record<string, any>, biz) => {
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

  const categoryCounts = addressBusinesses.reduce(
    (acc: Record<string, number>, biz) => {
      const category = biz.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {}
  );

  const title = `${address} – Businesses on ${streetName}, ${cityName} | Local Street Shop`;
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
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-10">
              <p className="text-sm uppercase tracking-widest opacity-90 mb-3">
                Virtual Street Walk
              </p>

              <h1 className="text-4xl md:text-5xl font-bold">📍 {address}</h1>

              <p className="mt-4 text-xl text-blue-100">
                Stop {currentStopIndex + 1} of {addressStops.length} on{' '}
                {streetName}
              </p>

              <div className="mt-6">
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

              <div className="flex flex-wrap gap-2 mt-5">
                {Object.entries(categoryCounts).map(([category, count]) => (
                  <span
                    key={category}
                    className="bg-white/15 text-white px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    {category} ({count})
                  </span>
                ))}
              </div>

              <div className="mt-7">
                <AutoWalkControls
                  nextStopHref={nextStopHref}
                  streetHref={streetHref}
                  isLastStop={!nextStop}
                />
              </div>
            </div>

            <div className="p-6 border-b bg-white">
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

            <div className="p-6 border-b bg-gray-50">
              <p className="text-sm font-bold text-gray-600 mb-3">
                Jump to any stop
              </p>

              <div className="flex flex-wrap gap-2">
                {addressStops.map((stop: any, index: number) => {
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

            <div className="p-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-5">
                Businesses at this address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addressBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/cities/${city}/${street}/${biz.slug}`}
                    className="block rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition p-5"
                  >
                    <h3 className="text-xl font-bold text-blue-700">
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
                  </Link>
                ))}
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

          <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow-md p-8">
            {nextStop ? (
              <>
                <p className="text-blue-100 mb-2">Ready for the next stop?</p>
                <h2 className="text-2xl font-bold mb-5">
                  Continue walking {streetName}
                </h2>

                <AutoWalkControls
                  nextStopHref={nextStopHref}
                  streetHref={streetHref}
                  isLastStop={false}
                />
              </>
            ) : (
              <>
                <p className="text-blue-100 mb-2">You reached the end.</p>
                <h2 className="text-2xl font-bold mb-5">
                  Street walk complete
                </h2>

                <AutoWalkControls
                  nextStopHref={null}
                  streetHref={streetHref}
                  isLastStop={true}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}