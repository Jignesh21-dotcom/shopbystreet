import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type PageProps = {
  params: Promise<{
    city: string;
    street: string;
    shop: string;
  }>;
};

type CountryRecord = {
  slug: string;
};

type StateRecord = {
  slug: string;
  country: CountryRecord | CountryRecord[] | null;
};

type CityRecord = {
  slug: string;
  state: StateRecord | StateRecord[] | null;
};

type StreetRecord = {
  id: string;
  slug: string;
  city: CityRecord | CityRecord[] | null;
};

type ShopRecord = {
  id: string;
  name: string;
  slug: string;
  street_id: string | null;
  city_id: string | null;
  province_id: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  sale_price: number | string | null;
  description: string | null;
  image_url: string | null;
  accepts_order_requests: boolean;
  stock_status: string;
  quantity_available: number | null;
  pickup_available: boolean;
  local_delivery_available: boolean;
  shipping_available: boolean;
  fulfillment_notes: string | null;
  maximum_request_quantity: number | null;
};

type ShopOrderSettings = {
  accepts_order_requests: boolean;
  offers_pickup: boolean;
  offers_local_delivery: boolean;
  offers_shipping: boolean;
  response_time_minutes: number | null;
  request_expiry_hours: number | null;
  minimum_order_amount: number | string | null;
};

const normalizeSlug = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '-').trim();

const getSingleRecord = <T,>(value: T | T[] | null | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const formatINR = (value: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 'Price not listed';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Price not listed';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const shopSlug = normalizeSlug(
    decodeURIComponent(resolvedParams.shop || ''),
  );

  return {
    title: `Products from ${shopSlug.replace(/-/g, ' ')} | LocalStreetShop India`,
    description:
      'Browse products from this local Indian business on LocalStreetShop.',
    alternates: {
      canonical: `https://www.localstreetshop.com/countries/india/gujarat/${resolvedParams.city}/streets/${resolvedParams.street}/${resolvedParams.shop}/products`,
    },
  };
}

export default async function IndiaShopProductsPage({
  params,
}: PageProps) {
  const resolvedParams = await params;

  const citySlug = normalizeSlug(
    decodeURIComponent(resolvedParams.city || ''),
  );

  const streetSlug = normalizeSlug(
    decodeURIComponent(resolvedParams.street || ''),
  );

  const shopSlug = normalizeSlug(
    decodeURIComponent(resolvedParams.shop || ''),
  );

  const shopHref =
    `/countries/india/gujarat/${citySlug}` +
    `/streets/${streetSlug}/${shopSlug}`;

  /*
   * Load the street first and verify that it belongs to:
   *
   * India → Gujarat → requested city → requested street
   *
   * This avoids accidentally matching a Canadian street that has
   * the same slug.
   */
  const { data: streetData, error: streetError } = await supabase
    .from('streets')
    .select(`
      id,
      slug,
      city:cities!inner(
        slug,
        state:provinces!inner(
          slug,
          country:countries!inner(
            slug
          )
        )
      )
    `)
    .eq('slug', streetSlug)
    .eq('city.slug', citySlug)
    .eq('city.state.slug', 'gujarat')
    .eq('city.state.country.slug', 'india')
    .maybeSingle();

  if (streetError) {
    console.error(
      'India products street lookup failed:',
      streetError,
    );
  }

  const verifiedStreet = streetData as StreetRecord | null;

  if (!verifiedStreet) {
    return (
      <NotFound
        citySlug={citySlug}
        streetSlug={streetSlug}
      />
    );
  }

  const cityRecord = getSingleRecord(verifiedStreet.city);
  const stateRecord = getSingleRecord(cityRecord?.state);
  const countryRecord = getSingleRecord(stateRecord?.country);

  const hasCorrectHierarchy =
    normalizeSlug(cityRecord?.slug || '') === citySlug &&
    normalizeSlug(stateRecord?.slug || '') === 'gujarat' &&
    normalizeSlug(countryRecord?.slug || '') === 'india';

  if (!hasCorrectHierarchy) {
    return (
      <NotFound
        citySlug={citySlug}
        streetSlug={streetSlug}
      />
    );
  }

  /*
   * Load the approved shop from the shared shops table.
   *
   * No India-specific shop table is required.
   */
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      slug,
      street_id,
      city_id,
      province_id
    `)
    .eq('street_id', verifiedStreet.id)
    .eq('slug', shopSlug)
    .eq('approved', true)
    .maybeSingle();

  if (shopError) {
    console.error(
      'India products shop lookup failed:',
      shopError,
    );
  }

  const shop = shopData as ShopRecord | null;

  if (!shop) {
    return (
      <NotFound
        citySlug={citySlug}
        streetSlug={streetSlug}
      />
    );
  }

  /*
   * Products and Order Request settings use the same tables as Canada.
   *
   * Order Request availability comes from shop_order_settings,
   * not from the shops table.
   */
  const [productsResult, settingsResult] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        sale_price,
        description,
        image_url,
        accepts_order_requests,
        stock_status,
        quantity_available,
        pickup_available,
        local_delivery_available,
        shipping_available,
        fulfillment_notes,
        maximum_request_quantity
      `)
      .eq('shop_id', shop.id)
      .eq('is_active', true)
      .order('name', { ascending: true }),

    supabase
      .from('shop_order_settings')
      .select(`
        accepts_order_requests,
        offers_pickup,
        offers_local_delivery,
        offers_shipping,
        response_time_minutes,
        request_expiry_hours,
        minimum_order_amount
      `)
      .eq('shop_id', shop.id)
      .maybeSingle(),
  ]);

  if (productsResult.error) {
    console.error(
      'Failed to fetch India shop products:',
      productsResult.error,
    );
  }

  if (settingsResult.error) {
    console.error(
      'Failed to fetch India shop order settings:',
      settingsResult.error,
    );
  }

  const products = (productsResult.data || []) as Product[];

  const orderSettings =
    (settingsResult.data as ShopOrderSettings | null) ?? null;

  const shopAcceptsOrderRequests =
    orderSettings?.accepts_order_requests === true;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-12 text-gray-900">
      <section className="mx-auto max-w-6xl">
        <Link
          href={shopHref}
          className="mb-6 inline-block font-semibold text-orange-700 hover:underline"
        >
          ← Back to shop
        </Link>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-700">
            India Marketplace
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
            Products from {shop.name}
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Browse products from this Gujarat business. Prices are
            displayed in Indian rupees.
          </p>

          {shopAcceptsOrderRequests && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-900">
                🛍️ This shop accepts Order Requests
              </p>

              <p className="mt-1 text-sm text-green-800">
                Select an eligible product and submit a request. The
                business will confirm availability and contact you
                directly.
              </p>
            </div>
          )}

          {products.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const pickupAvailable =
                  shopAcceptsOrderRequests &&
                  orderSettings?.offers_pickup === true &&
                  product.pickup_available;

                const localDeliveryAvailable =
                  shopAcceptsOrderRequests &&
                  orderSettings?.offers_local_delivery === true &&
                  product.local_delivery_available;

                const shippingAvailable =
                  shopAcceptsOrderRequests &&
                  orderSettings?.offers_shipping === true &&
                  product.shipping_available;

                const availableFulfillmentMethods = [
                  pickupAvailable ? 'Pickup' : null,
                  localDeliveryAvailable
                    ? 'Local delivery'
                    : null,
                  shippingAvailable ? 'Shipping' : null,
                ].filter(
                  (method): method is string => Boolean(method),
                );

                const hasAvailableQuantity =
                  product.quantity_available === null ||
                  product.quantity_available > 0;

                const isInStock =
                  product.stock_status === 'in_stock' &&
                  hasAvailableQuantity;

                const canRequestOrder =
                  shopAcceptsOrderRequests &&
                  product.accepts_order_requests &&
                  isInStock &&
                  availableFulfillmentMethods.length > 0;

                const displayPrice =
                  product.sale_price !== null &&
                  product.sale_price !== undefined
                    ? product.sale_price
                    : product.price;

                const hasSalePrice =
                  product.sale_price !== null &&
                  product.sale_price !== undefined &&
                  Number(product.sale_price) <
                    Number(product.price);

                return (
                  <article
                    key={product.id}
                    className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex w-full flex-col">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-orange-50 text-sm font-semibold text-orange-700">
                          No image available
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="text-lg font-bold text-gray-950">
                          {product.name}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <p className="font-bold text-orange-700">
                            {formatINR(displayPrice)}
                          </p>

                          {hasSalePrice && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatINR(product.price)}
                            </p>
                          )}
                        </div>

                        {product.description && (
                          <p className="mt-3 text-sm leading-relaxed text-gray-600">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-4">
                          {isInStock ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                              In stock
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              Currently unavailable
                            </span>
                          )}
                        </div>

                        {availableFulfillmentMethods.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                              Available by
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {availableFulfillmentMethods.map(
                                (method) => (
                                  <span
                                    key={method}
                                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800"
                                  >
                                    {method}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {product.fulfillment_notes && (
                          <p className="mt-4 text-sm text-gray-600">
                            {product.fulfillment_notes}
                          </p>
                        )}

                        {product.maximum_request_quantity !==
                          null && (
                          <p className="mt-3 text-xs text-gray-500">
                            Maximum request quantity:{' '}
                            {product.maximum_request_quantity}
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          {canRequestOrder ? (
                            <Link
                              href={`${shopHref}/products/${product.id}/request`}
                              className="block w-full rounded-full bg-green-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                            >
                              🛍️ Request Order
                            </Link>
                          ) : (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-600">
                              {!shopAcceptsOrderRequests
                                ? 'This shop is not currently accepting Order Requests.'
                                : !product.accepts_order_requests
                                  ? 'Order Requests are not enabled for this product.'
                                  : !isInStock
                                    ? 'This product is currently unavailable.'
                                    : 'No fulfillment option is currently available.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-orange-900">
                No products listed yet
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                This business has not added products to
                LocalStreetShop yet. Please check back later or visit
                the shop profile for contact details.
              </p>

              <Link
                href={shopHref}
                className="mt-6 inline-block rounded-full bg-orange-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800"
              >
                Back to Shop
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function NotFound({
  citySlug,
  streetSlug,
}: {
  citySlug: string;
  streetSlug: string;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">
          Shop not found
        </h1>

        <p className="mt-3 text-gray-600">
          This shop could not be found on the selected India street.
        </p>

        <Link
          href={`/countries/india/gujarat/${citySlug}/streets/${streetSlug}`}
          className="mt-4 inline-block font-semibold text-orange-700 hover:underline"
        >
          Back to street
        </Link>
      </div>
    </main>
  );
}