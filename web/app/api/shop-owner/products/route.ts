import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type CreateProductPayload = {
  shopId: string;
  name: string;
  price: number;
  salePrice?: number | null;
  description: string;
  imageUrl?: string | null;
};

const FREE_TIER_LIMIT = 100;

const resolveProductLimit = (rawLimit: unknown): number | null => {
  if (rawLimit === null || rawLimit === 'unlimited' || rawLimit === -1) {
    return null;
  }

  const parsed = Number(rawLimit);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return FREE_TIER_LIMIT;
  }

  return parsed;
};

export async function POST(req: Request) {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase URL is not configured.' },
        { status: 500 }
      );
    }

    if (!supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase anonymous key is not configured.' },
        { status: 500 }
      );
    }

    const supabaseServer = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : supabase;

    const authClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const authHeader = req.headers.get('authorization');

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } =
      await authClient.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const ownerId = authData.user.id;

    const allowedLimit = resolveProductLimit(
      authData.user.user_metadata?.productLimit
    );

    const body = (await req.json()) as CreateProductPayload;

    const shopId =
      typeof body.shopId === 'string'
        ? body.shopId.trim()
        : '';

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : '';

    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : '';

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

    if (
      !shopId ||
      !name ||
      !description ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid product fields.' },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        { error: 'Product name is too long.' },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { error: 'Product description is too long.' },
        { status: 400 }
      );
    }

    if (
      salePrice !== null &&
      (
        Number.isNaN(salePrice) ||
        salePrice <= 0 ||
        salePrice >= price
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Sale price must be greater than 0 and lower than regular price.',
        },
        { status: 400 }
      );
    }

    const { data: shop, error: shopError } =
      await supabaseServer
        .from('shops')
        .select(
          'id, owner_id, approved, allowed_product_limit, plan_tier'
        )
        .eq('id', shopId)
        .maybeSingle();

    if (shopError) {
      return NextResponse.json(
        { error: shopError.message },
        { status: 500 }
      );
    }

    if (
      !shop ||
      shop.owner_id !== ownerId ||
      !shop.approved
    ) {
      return NextResponse.json(
        {
          error:
            'You are not allowed to add products to this shop.',
        },
        { status: 403 }
      );
    }

    const shopLimit =
      shop.allowed_product_limit === null
        ? allowedLimit
        : Number(shop.allowed_product_limit);

    const finalLimit =
      Number.isNaN(shopLimit as number)
        ? allowedLimit
        : shopLimit;

    const { count, error: countError } =
      await supabaseServer
        .from('products')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('shop_id', shopId);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    const currentCount = count ?? 0;

    if (
      finalLimit !== null &&
      currentCount >= finalLimit
    ) {
      return NextResponse.json(
        {
          error:
            'Upload limit reached. Please upgrade your account tier to add more products.',
          code: 'TIER_LIMIT_REACHED',
          count: currentCount,
          limit: finalLimit,
        },
        { status: 403 }
      );
    }

    const { data: insertedProduct, error: insertError } =
      await supabaseServer
        .from('products')
        .insert([
          {
            name,
            price,
            sale_price: salePrice,
            description,
            image_url: imageUrl,
            owner_id: ownerId,
            shop_id: shopId,
            is_active: true,
          },
        ])
        .select('id')
        .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: insertedProduct.id,
      count: currentCount + 1,
      limit: finalLimit,
    });
  } catch (error) {
    console.error('Create product API error:', error);

    return NextResponse.json(
      { error: 'Unable to create product.' },
      { status: 500 }
    );
  }
}