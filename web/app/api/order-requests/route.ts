import { NextResponse } from 'next/server';
import { formatCurrency } from '@/lib/currency';
import { createClient } from '@supabase/supabase-js';
import {
  sendCustomerOrderRequestConfirmation,
  sendShopOwnerOrderRequestNotification,
} from '@/lib/marketplaceEmail';

type FulfillmentMethod =
  | 'pickup'
  | 'local_delivery'
  | 'shipping';

type CreateOrderRequestPayload = {
  productId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  quantity?: number;
  fulfillmentMethod?: FulfillmentMethod;
  deliveryAddressLine1?: string | null;
  deliveryAddressLine2?: string | null;
  deliveryCity?: string | null;
  deliveryProvince?: string | null;
  deliveryPostalCode?: string | null;
  deliveryCountry?: string | null;
  customerNote?: string | null;
};

type ProductRow = {
  id: string;
  shop_id: string;
  name: string;
  price: number | string;
  sale_price: number | string | null;
  image_url: string | null;
  accepts_order_requests: boolean;
  stock_status: string;
  quantity_available: number | null;
  pickup_available: boolean;
  local_delivery_available: boolean;
  shipping_available: boolean;
  maximum_request_quantity: number | null;
  is_active: boolean | null;
};

type ShopRow = {
  id: string;
  name: string;
  approved: boolean;
  owner_id: string | null;
  street_id: string | null;
};

type ShopOrderSettingsRow = {
  accepts_order_requests: boolean;
  offers_pickup: boolean;
  offers_local_delivery: boolean;
  offers_shipping: boolean;
  request_expiry_hours: number;
  minimum_order_amount: number | string | null;
  service_fee_amount: number | string;
};

const ALLOWED_FULFILLMENT_METHODS: FulfillmentMethod[] = [
  'pickup',
  'local_delivery',
  'shipping',
];

const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup: 'Pickup',
  local_delivery: 'Local Delivery',
  shipping: 'Shipping',
};

function createServerClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured.');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for Order Request creation.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getAuthenticatedUserId(
  req: Request,
  supabaseServer: ReturnType<typeof createServerClient>,
) {
  const authorization = req.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authorization.slice('Bearer '.length).trim();

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user.id;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const supabaseServer = createServerClient();

    const customerUserId = await getAuthenticatedUserId(
      req,
      supabaseServer,
    );

    const body =
      (await req.json()) as CreateOrderRequestPayload;

    const productId =
      typeof body.productId === 'string'
        ? body.productId.trim()
        : '';

    const customerName =
      typeof body.customerName === 'string'
        ? body.customerName.trim()
        : '';

    const customerEmail =
      typeof body.customerEmail === 'string'
        ? body.customerEmail.trim().toLowerCase()
        : '';

    const customerPhone =
      normalizeOptionalText(body.customerPhone);

    const quantity = Number(body.quantity);

    const fulfillmentMethod =
      typeof body.fulfillmentMethod === 'string'
        ? body.fulfillmentMethod
        : '';

    const deliveryAddressLine1 =
      normalizeOptionalText(body.deliveryAddressLine1);

    const deliveryAddressLine2 =
      normalizeOptionalText(body.deliveryAddressLine2);

    const deliveryCity =
      normalizeOptionalText(body.deliveryCity);

    const deliveryProvince =
      normalizeOptionalText(body.deliveryProvince);

    const deliveryPostalCode =
      normalizeOptionalText(body.deliveryPostalCode)?.toUpperCase() ??
      null;

    const deliveryCountry =
      normalizeOptionalText(body.deliveryCountry) || 'Canada';

    const customerNote =
      normalizeOptionalText(body.customerNote);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required.' },
        { status: 400 },
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required.' },
        { status: 400 },
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'A valid customer email is required.' },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a whole number of at least 1.' },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_FULFILLMENT_METHODS.includes(
        fulfillmentMethod as FulfillmentMethod,
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid fulfillment method.' },
        { status: 400 },
      );
    }

    if (
      fulfillmentMethod === 'local_delivery' &&
      !deliveryAddressLine1
    ) {
      return NextResponse.json(
        {
          error:
            'A delivery address is required for Local Delivery.',
        },
        { status: 400 },
      );
    }

    if (
      (
        fulfillmentMethod === 'local_delivery' ||
        fulfillmentMethod === 'shipping'
      ) &&
      (
        !deliveryCity ||
        !deliveryProvince ||
        !deliveryPostalCode
      )
    ) {
      return NextResponse.json(
        {
          error:
            'City, province, and postal code are required.',
        },
        { status: 400 },
      );
    }

    const { data: productData, error: productError } =
      await supabaseServer
        .from('products')
        .select(`
          id,
          shop_id,
          name,
          price,
          sale_price,
          image_url,
          accepts_order_requests,
          stock_status,
          quantity_available,
          pickup_available,
          local_delivery_available,
          shipping_available,
          maximum_request_quantity,
          is_active
        `)
        .eq('id', productId)
        .maybeSingle();

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 500 },
      );
    }

    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 },
      );
    }

    const product = productData as ProductRow;

    const [{ data: shopData, error: shopError }, {
      data: settingsData,
      error: settingsError,
    }] = await Promise.all([
      supabaseServer
        .from('shops')
        .select('id, name, approved, owner_id, street_id')
        .eq('id', product.shop_id)
        .maybeSingle(),

      supabaseServer
        .from('shop_order_settings')
        .select(`
          accepts_order_requests,
          offers_pickup,
          offers_local_delivery,
          offers_shipping,
          request_expiry_hours,
          minimum_order_amount,
          service_fee_amount
        `)
        .eq('shop_id', product.shop_id)
        .maybeSingle(),
    ]);

    if (shopError) {
      return NextResponse.json(
        { error: shopError.message },
        { status: 500 },
      );
    }

    if (settingsError) {
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 },
      );
    }

    if (!shopData || !settingsData) {
      return NextResponse.json(
        {
          error:
            'This shop is not currently configured for Order Requests.',
        },
        { status: 400 },
      );
    }

    const shop = shopData as ShopRow;
    const settings =
      settingsData as ShopOrderSettingsRow;

    let countrySlug: string | null = null;

    if (shop.street_id) {
      const { data: streetLocation } = await supabaseServer
        .from('streets')
        .select('country')
        .eq('id', shop.street_id)
        .maybeSingle();

      countrySlug = streetLocation?.country || null;
    }

    if (!shop.approved) {
      return NextResponse.json(
        { error: 'This shop is not currently available.' },
        { status: 400 },
      );
    }

    if (
      product.is_active !== true ||
      product.accepts_order_requests !== true ||
      settings.accepts_order_requests !== true
    ) {
      return NextResponse.json(
        {
          error:
            'This product is not currently accepting Order Requests.',
        },
        { status: 400 },
      );
    }

    if (
      product.stock_status === 'out_of_stock' ||
      product.quantity_available === 0
    ) {
      return NextResponse.json(
        { error: 'This product is currently unavailable.' },
        { status: 400 },
      );
    }

    if (
      product.maximum_request_quantity !== null &&
      quantity > product.maximum_request_quantity
    ) {
      return NextResponse.json(
        {
          error: `The maximum request quantity is ${product.maximum_request_quantity}.`,
        },
        { status: 400 },
      );
    }

    if (
      product.quantity_available !== null &&
      quantity > product.quantity_available
    ) {
      return NextResponse.json(
        {
          error:
            'The requested quantity is greater than the available quantity.',
        },
        { status: 400 },
      );
    }

    const methodIsAvailable =
      fulfillmentMethod === 'pickup'
        ? settings.offers_pickup &&
          product.pickup_available
        : fulfillmentMethod === 'local_delivery'
          ? settings.offers_local_delivery &&
            product.local_delivery_available
          : settings.offers_shipping &&
            product.shipping_available;

    if (!methodIsAvailable) {
      return NextResponse.json(
        {
          error:
            'The selected fulfillment method is not available for this product.',
        },
        { status: 400 },
      );
    }

    const productPrice =
      product.sale_price !== null
        ? Number(product.sale_price)
        : Number(product.price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        { error: 'The product price is invalid.' },
        { status: 500 },
      );
    }

    const estimatedTotal = productPrice * quantity;

    if (
      settings.minimum_order_amount !== null &&
      estimatedTotal <
        Number(settings.minimum_order_amount)
    ) {
      return NextResponse.json(
        {
          error: `This shop requires a minimum request amount of ${formatCurrency(
            settings.minimum_order_amount,
            countrySlug,
          )}.`,
        },
        { status: 400 },
      );
    }

    const expiryHours =
      Number(settings.request_expiry_hours) > 0
        ? Number(settings.request_expiry_hours)
        : 24;

    const expiresAt = new Date(
      Date.now() + expiryHours * 60 * 60 * 1000,
    ).toISOString();

    const customerAccessToken = crypto.randomUUID();

    const { data: insertedRequest, error: insertError } =
      await supabaseServer
        .from('order_requests')
        .insert({
          shop_id: shop.id,
          product_id: product.id,
          customer_user_id: customerUserId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          quantity,
          fulfillment_method: fulfillmentMethod,
          delivery_address_line_1:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryAddressLine1,
          delivery_address_line_2:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryAddressLine2,
          delivery_city:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryCity,
          delivery_province:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryProvince,
          delivery_postal_code:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryPostalCode,
          delivery_country:
            fulfillmentMethod === 'pickup'
              ? null
              : deliveryCountry,
          customer_note: customerNote,
          product_name_snapshot: product.name,
          product_price_snapshot: productPrice,
          product_image_snapshot: product.image_url,
          shop_name_snapshot: shop.name,
          customer_access_token: customerAccessToken,
          status: 'pending',
          service_fee_amount: Number(
            settings.service_fee_amount,
          ),
          service_fee_applies: false,
          introductory_fee_waived: false,
          expires_at: expiresAt,
        })
        .select(`
          id,
          request_number,
          customer_access_token,
          status,
          expires_at
        `)
        .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    const returnedAccessToken =
      insertedRequest.customer_access_token ||
      customerAccessToken;

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL;

    const siteUrl = configuredSiteUrl
      ? configuredSiteUrl.startsWith('http')
        ? configuredSiteUrl
        : `https://${configuredSiteUrl}`
      : new URL(req.url).origin;

    const trackingUrl =
      `${siteUrl}/order-request/${encodeURIComponent(
        insertedRequest.request_number,
      )}?token=${encodeURIComponent(returnedAccessToken)}`;

    const shopOwnerDashboardUrl =
      `${siteUrl}/shop-owner/orders`;

    try {
      await sendCustomerOrderRequestConfirmation({
        customerName,
        customerEmail,
        requestNumber: insertedRequest.request_number,
        shopName: shop.name,
        productName: product.name,
        quantity,
        estimatedTotal,
        fulfillmentLabel:
          FULFILLMENT_LABELS[
            fulfillmentMethod as FulfillmentMethod
          ],
        trackingUrl,
      });
    } catch (emailError) {
      console.error(
        'Customer Order Request confirmation email failed:',
        emailError,
      );
    }

    if (shop.owner_id) {
      try {
        const {
          data: ownerData,
          error: ownerError,
        } = await supabaseServer.auth.admin.getUserById(
          shop.owner_id,
        );

        if (ownerError) {
          throw ownerError;
        }

        const ownerEmail = ownerData.user?.email;

        if (!ownerEmail) {
          throw new Error(
            'The shop owner account does not have an email address.',
          );
        }

        await sendShopOwnerOrderRequestNotification({
          ownerEmail,
          shopName: shop.name,
          requestNumber: insertedRequest.request_number,
          customerName,
          customerEmail,
          customerPhone,
          productName: product.name,
          quantity,
          estimatedTotal,
          fulfillmentLabel:
            FULFILLMENT_LABELS[
              fulfillmentMethod as FulfillmentMethod
            ],
          customerNote,
          dashboardUrl: shopOwnerDashboardUrl,
        });
      } catch (ownerEmailError) {
        console.error(
          'Shop owner Order Request notification email failed:',
          ownerEmailError,
        );
      }
    } else {
      console.warn(
        `Order Request ${insertedRequest.request_number} was created for a shop without an owner_id.`,
      );
    }

    return NextResponse.json(
      {
        success: true,
        requestNumber:
          insertedRequest.request_number,
        customerAccessToken: returnedAccessToken,
        request: insertedRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create Order Request API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create Order Request.',
      },
      { status: 500 },
    );
  }
}
