import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  description: string;
  image_url: string | null;
  owner_id: string;
  shop_id: string;
  is_active: boolean;
  accepts_order_requests: boolean;
  stock_status: string;
  quantity_available: number | null;
  pickup_available: boolean;
  local_delivery_available: boolean;
  shipping_available: boolean;
  fulfillment_notes: string | null;
  maximum_request_quantity: number | null;
};

type ShopRow = {
  id: string;
  name: string;
  owner_id: string;
  approved: boolean;
};

type SupabaseServerClient = SupabaseClient<any, any, any, any, any>;

type UpdateProductPayload = {
  name?: string;
  price?: number;
  salePrice?: number | null;
  description?: string;
  imageUrl?: string | null;
  acceptsOrderRequests?: boolean;
  stockStatus?: string;
  quantityAvailable?: number | null;
  pickupAvailable?: boolean;
  localDeliveryAvailable?: boolean;
  shippingAvailable?: boolean;
  fulfillmentNotes?: string | null;
  maximumRequestQuantity?: number | null;
};

const ALLOWED_STOCK_STATUSES = [
  'in_stock',
  'low_stock',
  'out_of_stock',
  'made_to_order',
  'contact_shop',
] as const;

type StockStatus = (typeof ALLOWED_STOCK_STATUSES)[number];

function getSupabaseClients() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('Supabase URL is not configured.');
  if (!supabaseAnonKey) throw new Error('Supabase anonymous key is not configured.');

  const supabaseServer = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : supabase;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { supabaseServer, authClient };
}

async function authenticateRequest(req: Request) {
  const { supabaseServer, authClient } = getSupabaseClients();
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }),
    };
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(token);

  if (authError || !authData?.user) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }),
    };
  }

  return {
    supabaseServer: supabaseServer as SupabaseServerClient,
    user: authData.user as User,
  };
}

async function getOwnedProduct(
  supabaseServer: SupabaseServerClient,
  productId: string,
  ownerId: string,
) {
  const { data: productData, error: productError } = await supabaseServer
    .from('products')
    .select(`
      id,
      name,
      price,
      sale_price,
      description,
      image_url,
      owner_id,
      shop_id,
      is_active,
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
    .maybeSingle();

  const product = productData as ProductRow | null;

  if (productError) {
    return {
      errorResponse: NextResponse.json({ error: productError.message }, { status: 500 }),
    };
  }

  if (!product) {
    return {
      errorResponse: NextResponse.json({ error: 'Product not found.' }, { status: 404 }),
    };
  }

  const { data: shopData, error: shopError } = await supabaseServer
    .from('shops')
    .select('id, name, owner_id, approved')
    .eq('id', product.shop_id)
    .maybeSingle();

  const shop = shopData as ShopRow | null;

  if (shopError) {
    return {
      errorResponse: NextResponse.json({ error: shopError.message }, { status: 500 }),
    };
  }

  if (!shop || shop.owner_id !== ownerId || product.owner_id !== ownerId || !shop.approved) {
    return {
      errorResponse: NextResponse.json(
        { error: 'You are not allowed to manage this product.' },
        { status: 403 },
      ),
    };
  }

  return { product, shop };
}

function readNullableInteger(value: unknown, fieldName: string, minimum: number) {
  if (value === null || value === undefined || value === '') {
    return { value: null as number | null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < minimum) {
    return { error: `${fieldName} must be a whole number of at least ${minimum}.` };
  }

  return { value: parsed };
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id: rawProductId } = await context.params;
    const productId = rawProductId?.trim();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const auth = await authenticateRequest(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const ownedProduct = await getOwnedProduct(
      auth.supabaseServer,
      productId,
      auth.user.id,
    );

    if ('errorResponse' in ownedProduct) return ownedProduct.errorResponse;

    return NextResponse.json({
      product: ownedProduct.product,
      shop: { id: ownedProduct.shop.id, name: ownedProduct.shop.name },
    });
  } catch (error) {
    console.error('Load product API error:', error);
    return NextResponse.json({ error: 'Unable to load product.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id: rawProductId } = await context.params;
    const productId = rawProductId?.trim();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const auth = await authenticateRequest(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const ownedProduct = await getOwnedProduct(
      auth.supabaseServer,
      productId,
      auth.user.id,
    );

    if ('errorResponse' in ownedProduct) return ownedProduct.errorResponse;

    const body = (await req.json()) as UpdateProductPayload;

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    const imageUrl =
      typeof body.imageUrl === 'string' && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null;
    const price = Number(body.price);
    const salePrice =
      body.salePrice !== undefined &&
      body.salePrice !== null &&
      String(body.salePrice).trim() !== ''
        ? Number(body.salePrice)
        : null;

    if (!name || !description || Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid product fields.' },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json({ error: 'Product name is too long.' }, { status: 400 });
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { error: 'Product description is too long.' },
        { status: 400 },
      );
    }

    if (
      salePrice !== null &&
      (Number.isNaN(salePrice) || salePrice <= 0 || salePrice >= price)
    ) {
      return NextResponse.json(
        { error: 'Sale price must be greater than 0 and lower than regular price.' },
        { status: 400 },
      );
    }

    const stockStatus =
      typeof body.stockStatus === 'string' ? body.stockStatus.trim() : '';

    if (!ALLOWED_STOCK_STATUSES.includes(stockStatus as StockStatus)) {
      return NextResponse.json({ error: 'Invalid stock status.' }, { status: 400 });
    }

    const quantityResult = readNullableInteger(
      body.quantityAvailable,
      'Quantity available',
      0,
    );

    if ('error' in quantityResult) {
      return NextResponse.json({ error: quantityResult.error }, { status: 400 });
    }

    const maximumResult = readNullableInteger(
      body.maximumRequestQuantity,
      'Maximum request quantity',
      1,
    );

    if ('error' in maximumResult) {
      return NextResponse.json({ error: maximumResult.error }, { status: 400 });
    }

    const acceptsOrderRequests = body.acceptsOrderRequests === true;
    const pickupAvailable = body.pickupAvailable === true;
    const localDeliveryAvailable = body.localDeliveryAvailable === true;
    const shippingAvailable = body.shippingAvailable === true;
    const fulfillmentNotes =
      typeof body.fulfillmentNotes === 'string' && body.fulfillmentNotes.trim()
        ? body.fulfillmentNotes.trim()
        : null;

    if (fulfillmentNotes !== null && fulfillmentNotes.length > 2000) {
      return NextResponse.json(
        { error: 'Fulfillment notes are too long.' },
        { status: 400 },
      );
    }

    if (
      acceptsOrderRequests &&
      !pickupAvailable &&
      !localDeliveryAvailable &&
      !shippingAvailable
    ) {
      return NextResponse.json(
        {
          error:
            'Select at least one fulfillment option before enabling Order Requests.',
        },
        { status: 400 },
      );
    }

    if (
      acceptsOrderRequests &&
      (stockStatus === 'out_of_stock' || quantityResult.value === 0)
    ) {
      return NextResponse.json(
        { error: 'An out-of-stock product cannot accept Order Requests.' },
        { status: 400 },
      );
    }

    if (
      maximumResult.value !== null &&
      quantityResult.value !== null &&
      maximumResult.value > quantityResult.value
    ) {
      return NextResponse.json(
        {
          error:
            'Maximum request quantity cannot exceed quantity available.',
        },
        { status: 400 },
      );
    }

    const { data: updatedProduct, error: updateError } = await auth.supabaseServer
      .from('products')
      .update({
        name,
        price,
        original_price: salePrice !== null ? price : null,
        sale_price: salePrice,
        description,
        image_url: imageUrl,
        accepts_order_requests: acceptsOrderRequests,
        stock_status: stockStatus,
        quantity_available: quantityResult.value,
        pickup_available: pickupAvailable,
        local_delivery_available: localDeliveryAvailable,
        shipping_available: shippingAvailable,
        fulfillment_notes: fulfillmentNotes,
        maximum_request_quantity: maximumResult.value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('owner_id', auth.user.id)
      .select(`
        id,
        name,
        price,
        sale_price,
        description,
        image_url,
        shop_id,
        accepts_order_requests,
        stock_status,
        quantity_available,
        pickup_available,
        local_delivery_available,
        shipping_available,
        fulfillment_notes,
        maximum_request_quantity
      `)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product API error:', error);
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}