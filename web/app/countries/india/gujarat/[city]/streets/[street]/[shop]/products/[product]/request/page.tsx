import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import RequestOrderClient from './RequestOrderClient';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

type PageProps = {
  params: Promise<{
    city: string;
    street: string;
    shop: string;
    product: string;
  }>;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
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

type OrderSettingsRow = {
  accepts_order_requests: boolean;
  offers_pickup: boolean;
  offers_local_delivery: boolean;
  offers_shipping: boolean;
  response_time_minutes: number;
  request_expiry_hours: number;
  minimum_order_amount: number | string | null;
  request_instructions: string | null;
  local_delivery_notes: string | null;
  shipping_notes: string | null;
};

type ShopRow = {
  id: string;
  name: string;
  slug: string;
};

const normalizeSlug = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '-').trim();

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: 'Request Order | LocalStreetShop',
    description:
      'Submit an Order Request to a local business through LocalStreetShop.',
    alternates: {
      canonical: `https://www.localstreetshop.com/countries/india/gujarat/${resolvedParams.city}/streets/${resolvedParams.street}/${resolvedParams.shop}/products/${resolvedParams.product}/request`,
    },
  };
}

export default async function RequestOrderPage({ params }: PageProps) {
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
  const productId = decodeURIComponent(
    resolvedParams.product || '',
  ).trim();

  const productsHref = `/countries/india/gujarat/${citySlug}/streets/${streetSlug}/${shopSlug}/products`;
  const shopHref = `/countries/india/gujarat/${citySlug}/streets/${streetSlug}/${shopSlug}`;

  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select(`id, name, slug, street:streets!inner(slug, city:cities!inner(slug, state:provinces!inner(slug, country:countries!inner(slug))))`)
    .eq('slug', shopSlug)
    .eq('approved', true)
    .eq('street.slug', streetSlug)
    .eq('street.city.slug', citySlug)
    .eq('street.city.state.slug', 'gujarat')
    .eq('street.city.state.country.slug', 'india')
    .maybeSingle();

  if (shopError || !shopData) {
    return <UnavailableState message="This India shop could not be found." backHref={productsHref} />;
  }

  const shop = shopData as unknown as ShopRow;

  const [productResult, settingsResult] = await Promise.all([
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
      .eq('id', productId)
      .eq('shop_id', shop.id)
      .eq('is_active', true)
      .maybeSingle(),

    supabase
      .from('shop_order_settings')
      .select(`
        accepts_order_requests,
        offers_pickup,
        offers_local_delivery,
        offers_shipping,
        response_time_minutes,
        request_expiry_hours,
        minimum_order_amount,
        request_instructions,
        local_delivery_notes,
        shipping_notes
      `)
      .eq('shop_id', shop.id)
      .maybeSingle(),
  ]);

  if (productResult.error || !productResult.data) {
    return (
      <UnavailableState
        message="This product could not be found or is no longer available."
        backHref={productsHref}
      />
    );
  }

  if (settingsResult.error || !settingsResult.data) {
    return (
      <UnavailableState
        message="This shop is not currently accepting Order Requests."
        backHref={productsHref}
      />
    );
  }

  const product = productResult.data as ProductRow;
  const settings = settingsResult.data as OrderSettingsRow;

  const pickupAvailable =
    settings.accepts_order_requests &&
    settings.offers_pickup &&
    product.pickup_available;

  const localDeliveryAvailable =
    settings.accepts_order_requests &&
    settings.offers_local_delivery &&
    product.local_delivery_available;

  const shippingAvailable =
    settings.accepts_order_requests &&
    settings.offers_shipping &&
    product.shipping_available;

  const availableMethods = [
    pickupAvailable ? 'pickup' : null,
    localDeliveryAvailable ? 'local_delivery' : null,
    shippingAvailable ? 'shipping' : null,
  ].filter(
    (
      method,
    ): method is 'pickup' | 'local_delivery' | 'shipping' =>
      Boolean(method),
  );

  const hasQuantity =
    product.quantity_available === null ||
    product.quantity_available > 0;

  const stockAllowsRequest =
    product.stock_status !== 'out_of_stock' && hasQuantity;

  const canRequest =
    settings.accepts_order_requests &&
    product.accepts_order_requests &&
    stockAllowsRequest &&
    availableMethods.length > 0;

  if (!canRequest) {
    return (
      <UnavailableState
        message="This product is not currently eligible for an Order Request."
        backHref={productsHref}
      />
    );
  }

  const displayPrice =
    product.sale_price !== null
      ? Number(product.sale_price)
      : Number(product.price);

  const effectiveMaximum = [
    product.maximum_request_quantity,
    product.quantity_available,
  ].reduce<number | null>((current, value) => {
    if (value === null) return current;
    if (current === null) return value;
    return Math.min(current, value);
  }, null);

  return (
    <RequestOrderClient
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.image_url,
        price: displayPrice,
        stockStatus: product.stock_status,
        fulfillmentNotes: product.fulfillment_notes,
        maximumQuantity: effectiveMaximum,
      }}
      shop={{
        id: shop.id,
        name: shop.name,
      }}
      settings={{
        availableMethods,
        responseTimeMinutes: settings.response_time_minutes,
        requestExpiryHours: settings.request_expiry_hours,
        minimumOrderAmount:
          settings.minimum_order_amount === null
            ? null
            : Number(settings.minimum_order_amount),
        requestInstructions: settings.request_instructions,
        localDeliveryNotes: settings.local_delivery_notes,
        shippingNotes: settings.shipping_notes,
      }}
      productsHref={productsHref}
      shopHref={shopHref}
    />
  );
}

function UnavailableState({
  message,
  backHref,
}: {
  message: string;
  backHref: string;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div className="text-4xl" aria-hidden="true">
          🛍️
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-slate-950">
          Order Request unavailable
        </h1>

        <p className="mt-3 text-slate-600">{message}</p>

        <Link
          href={backHref}
          className="mt-6 inline-flex rounded-full bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
        >
          Back to Products
        </Link>
      </div>
    </main>
  );
}