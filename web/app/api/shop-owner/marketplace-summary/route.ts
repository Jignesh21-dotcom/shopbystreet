import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const INTRODUCTORY_FREE_ACCEPTED_LIMIT = 5;
const ACCEPTED_LIFECYCLE_STATUSES = [
  'accepted',
  'contacted',
  'completed',
];

function getSupabaseClients() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonymousKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured.');
  }

  if (!anonymousKey) {
    throw new Error(
      'Supabase anonymous key is not configured.',
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for marketplace summaries.',
    );
  }

  const authClient = createClient(
    supabaseUrl,
    anonymousKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const supabaseServer = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return {
    authClient,
    supabaseServer,
  };
}

export async function GET(req: Request) {
  try {
    const { authClient, supabaseServer } =
      getSupabaseClients();

    const authorization =
      req.headers.get('authorization');

    const accessToken =
      authorization?.startsWith('Bearer ')
        ? authorization
            .slice('Bearer '.length)
            .trim()
        : '';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 },
      );
    }

    const { data: shops, error: shopsError } =
      await supabaseServer
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .eq('approved', true);

    if (shopsError) {
      return NextResponse.json(
        { error: shopsError.message },
        { status: 500 },
      );
    }

    const shopIds = (shops || []).map(
      (shop: { id: string }) => shop.id,
    );

    if (shopIds.length === 0) {
      return NextResponse.json(
        { shops: [] },
        {
          status: 200,
          headers: {
            'Cache-Control':
              'private, no-store, max-age=0',
          },
        },
      );
    }

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();

    const [
      pendingResult,
      acceptedResult,
      pendingLedgerResult,
      monthlyLedgerResult,
    ] = await Promise.all([
      supabaseServer
        .from('order_requests')
        .select('shop_id')
        .in('shop_id', shopIds)
        .eq('status', 'pending'),

      supabaseServer
        .from('order_requests')
        .select('shop_id')
        .in('shop_id', shopIds)
        .in(
          'status',
          ACCEPTED_LIFECYCLE_STATUSES,
        ),

      supabaseServer
        .from('service_fee_ledger')
        .select('shop_id, amount')
        .in('shop_id', shopIds)
        .eq('status', 'pending'),

      supabaseServer
        .from('service_fee_ledger')
        .select('shop_id')
        .in('shop_id', shopIds)
        .gte('created_at', monthStart),
    ]);

    const firstError =
      pendingResult.error ||
      acceptedResult.error ||
      pendingLedgerResult.error ||
      monthlyLedgerResult.error;

    if (firstError) {
      return NextResponse.json(
        { error: firstError.message },
        { status: 500 },
      );
    }

    const pendingByShop: Record<string, number> = {};
    const acceptedByShop: Record<string, number> = {};
    const monthlyAcceptedByShop: Record<string, number> = {};
    const pendingFeesByShop: Record<
      string,
      {
        count: number;
        total: number;
      }
    > = {};

    for (const row of pendingResult.data || []) {
      pendingByShop[row.shop_id] =
        (pendingByShop[row.shop_id] || 0) + 1;
    }

    for (const row of acceptedResult.data || []) {
      acceptedByShop[row.shop_id] =
        (acceptedByShop[row.shop_id] || 0) + 1;
    }

    for (const row of monthlyLedgerResult.data || []) {
      monthlyAcceptedByShop[row.shop_id] =
        (monthlyAcceptedByShop[row.shop_id] || 0) + 1;
    }

    for (const row of pendingLedgerResult.data || []) {
      const current = pendingFeesByShop[row.shop_id] || {
        count: 0,
        total: 0,
      };

      current.count += 1;
      current.total += Number(row.amount) || 0;
      pendingFeesByShop[row.shop_id] = current;
    }

    const summaries = shopIds.map((shopId) => {
      const acceptedRequestCount =
        acceptedByShop[shopId] || 0;

      const pendingFees =
        pendingFeesByShop[shopId] || {
          count: 0,
          total: 0,
        };

      return {
        shop_id: shopId,
        pending_order_count:
          pendingByShop[shopId] || 0,
        pending_fee_count: pendingFees.count,
        pending_fee_total: pendingFees.total,
        accepted_request_count:
          acceptedRequestCount,
        accepted_this_month_count:
          monthlyAcceptedByShop[shopId] || 0,
        free_requests_remaining: Math.max(
          INTRODUCTORY_FREE_ACCEPTED_LIMIT -
            acceptedRequestCount,
          0,
        ),
      };
    });

    return NextResponse.json(
      { shops: summaries },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    console.error(
      'Shop owner marketplace summary error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load marketplace summary.',
      },
      { status: 500 },
    );
  }
}