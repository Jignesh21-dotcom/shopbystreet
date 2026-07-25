import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BALANCE_STATUSES = ['pending', 'invoiced'];

type ShopLocationRow = {
  id: string;
  name: string;
  street?: {
    city?: {
      state?: {
        country?: {
          slug?: string | null;
        } | null;
      } | null;
    } | null;
  } | null;
};

function getShopCountrySlug(shop: ShopLocationRow) {
  const slug =
    shop.street?.city?.state?.country?.slug;

  return String(slug || 'canada')
    .toLowerCase()
    .trim();
}


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
      'SUPABASE_SERVICE_ROLE_KEY is required for billing.',
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
        .select(`
          id,
          name,
          street:streets!inner(
            city:cities!inner(
              state:provinces!inner(
                country:countries!inner(slug)
              )
            )
          )
        `)
        .eq('owner_id', user.id)
        .eq('approved', true)
        .order('name', { ascending: true });

    if (shopsError) {
      return NextResponse.json(
        { error: shopsError.message },
        { status: 500 },
      );
    }

    const ownedShopRows =
      (shops || []) as unknown as ShopLocationRow[];

    const ownedShops = ownedShopRows.map((shop) => ({
      id: shop.id,
      name: shop.name,
      countrySlug: getShopCountrySlug(shop),
    }));

    const shopIds = ownedShops.map(
      (shop) => shop.id,
    );

    if (shopIds.length === 0) {
      return NextResponse.json(
        {
          shops: [],
          entries: [],
          countrySlug: 'canada',
          summary: {
            currentBalance: 0,
            pendingAmount: 0,
            invoicedAmount: 0,
            paidAmount: 0,
            waivedAmount: 0,
            pendingCount: 0,
            invoicedCount: 0,
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control':
              'private, no-store, max-age=0',
          },
        },
      );
    }

    const { data: ledgerRows, error: ledgerError } =
      await supabaseServer
        .from('service_fee_ledger')
        .select(`
          id,
          shop_id,
          order_request_id,
          amount,
          status,
          description,
          stripe_invoice_id,
          stripe_payment_intent_id,
          created_at,
          invoiced_at,
          paid_at,
          waived_at,
          refunded_at
        `)
        .in('shop_id', shopIds)
        .order('created_at', { ascending: false });

    if (ledgerError) {
      return NextResponse.json(
        { error: ledgerError.message },
        { status: 500 },
      );
    }

    const orderRequestIds = Array.from(
      new Set(
        (ledgerRows || [])
          .map(
            (row: { order_request_id: string }) =>
              row.order_request_id,
          )
          .filter(Boolean),
      ),
    );

    let orderRequestById: Record<
      string,
      {
        request_number: string;
        product_name_snapshot: string;
        shop_name_snapshot: string;
      }
    > = {};

    if (orderRequestIds.length > 0) {
      const {
        data: orderRequests,
        error: orderRequestsError,
      } = await supabaseServer
        .from('order_requests')
        .select(`
          id,
          request_number,
          product_name_snapshot,
          shop_name_snapshot
        `)
        .in('id', orderRequestIds);

      if (orderRequestsError) {
        return NextResponse.json(
          { error: orderRequestsError.message },
          { status: 500 },
        );
      }

      orderRequestById = (
        orderRequests || []
      ).reduce<
        Record<
          string,
          {
            request_number: string;
            product_name_snapshot: string;
            shop_name_snapshot: string;
          }
        >
      >((result, request) => {
        result[request.id] = {
          request_number: request.request_number,
          product_name_snapshot:
            request.product_name_snapshot,
          shop_name_snapshot:
            request.shop_name_snapshot,
        };

        return result;
      }, {});
    }

    const shopNameById = ownedShops.reduce<
      Record<string, string>
    >((result, shop) => {
      result[shop.id] = shop.name;
      return result;
    }, {});

    const normalizedCountries = Array.from(
      new Set(
        ownedShops.map((shop) => shop.countrySlug),
      ),
    );

    const countrySlug =
      normalizedCountries.length === 1
        ? normalizedCountries[0]
        : 'mixed';

    let pendingAmount = 0;
    let invoicedAmount = 0;
    let paidAmount = 0;
    let waivedAmount = 0;
    let pendingCount = 0;
    let invoicedCount = 0;

    const entries = (ledgerRows || []).map((row) => {
      const amount = Number(row.amount) || 0;

      if (row.status === 'pending') {
        pendingAmount += amount;
        pendingCount += 1;
      }

      if (row.status === 'invoiced') {
        invoicedAmount += amount;
        invoicedCount += 1;
      }

      if (row.status === 'paid') {
        paidAmount += amount;
      }

      if (row.status === 'waived') {
        waivedAmount += amount;
      }

      const orderRequest =
        orderRequestById[row.order_request_id];

      return {
        ...row,
        amount,
        shop_name:
          orderRequest?.shop_name_snapshot ||
          shopNameById[row.shop_id] ||
          'Shop',
        request_number:
          orderRequest?.request_number || null,
        product_name:
          orderRequest?.product_name_snapshot || null,
      };
    });

    return NextResponse.json(
      {
        shops: ownedShops,
        countrySlug,
        entries,
        summary: {
          currentBalance:
            pendingAmount + invoicedAmount,
          pendingAmount,
          invoicedAmount,
          paidAmount,
          waivedAmount,
          pendingCount,
          invoicedCount,
        },
      },
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
      'Shop owner billing API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load billing.',
      },
      { status: 500 },
    );
  }
}