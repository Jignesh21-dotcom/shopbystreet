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

const FREE_TIER_LIMIT = 10;

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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl && serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_URL is required when using SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const supabaseServer = serviceRoleKey && supabaseUrl
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

    const authClient =
      supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : supabase;

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: authData, error: authError } = await authClient.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const ownerId = authData.user.id;
    const allowedLimit = resolveProductLimit(authData.user.user_metadata?.productLimit);
    const body = (await req.json()) as CreateProductPayload;

    const shopId = body.shopId?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim();
    const imageUrl = body.imageUrl || null;
    const price = Number(body.price);
    const salePrice = body.salePrice !== undefined && body.salePrice !== null
      ? Number(body.salePrice)
      : null;

    if (!shopId || !name || !description || Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid product fields.' },
        { status: 400 }
      );
    }

    if (salePrice !== null && (Number.isNaN(salePrice) || salePrice <= 0 || salePrice >= price)) {
      return NextResponse.json(
        { error: 'Sale price must be greater than 0 and lower than regular price.' },
        { status: 400 }
      );
    }

    const { data: shop, error: shopError } = await supabaseServer
      .from('shops')
      .select('id, owner_id, approved')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError) {
      return NextResponse.json({ error: shopError.message }, { status: 500 });
    }

    if (!shop || shop.owner_id !== ownerId || !shop.approved) {
      return NextResponse.json(
        { error: 'You are not allowed to add products to this shop.' },
        { status: 403 }
      );
    }

    const { count, error: countError } = await supabaseServer
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const currentCount = count || 0;

    if (allowedLimit !== null && currentCount >= allowedLimit) {
      return NextResponse.json(
        {
          error: 'Upload limit reached. Please upgrade your account tier to add more products.',
          code: 'TIER_LIMIT_REACHED',
          count: currentCount,
          limit: allowedLimit,
        },
        { status: 403 }
      );
    }

    const discountPercent =
      salePrice !== null
        ? Math.round(((price - salePrice) / price) * 100)
        : null;

    const { data: insertedProduct, error: insertError } = await supabaseServer
      .from('products')
      .insert([
        {
          name,
          price,
          sale_price: salePrice,
          discount_percent: discountPercent,
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
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      productId: insertedProduct?.id,
      count: currentCount + 1,
      limit: allowedLimit,
    });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json(
      { error: 'Unable to create product.' },
      { status: 500 }
    );
  }
}
