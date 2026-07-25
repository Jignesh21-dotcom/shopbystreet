import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

const PAYABLE_LEDGER_STATUSES = [
  'pending',
  'invoiced',
];

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
      'SUPABASE_SERVICE_ROLE_KEY is required for billing checkout.',
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

export async function POST(req: Request) {
  let localPaymentSessionId: string | null = null;

  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not initialized.' },
        { status: 500 },
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { error: 'Site URL is not configured.' },
        { status: 500 },
      );
    }

    const {
      authClient,
      supabaseServer,
    } = getSupabaseClients();

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

    if (!user.email) {
      return NextResponse.json(
        {
          error:
            'Your account does not have an email address.',
        },
        { status: 400 },
      );
    }

    const { data: ownedShops, error: shopsError } =
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
        .eq('approved', true);

    if (shopsError) {
      return NextResponse.json(
        { error: shopsError.message },
        { status: 500 },
      );
    }

    const ownedShopRows =
      (ownedShops || []) as unknown as ShopLocationRow[];

    const normalizedOwnedShops =
      ownedShopRows.map((shop) => ({
        id: shop.id,
        name: shop.name,
        countrySlug: getShopCountrySlug(shop),
      }));

    const shopIds = normalizedOwnedShops.map(
      (shop) => shop.id,
    );

    const normalizedCountries = Array.from(
      new Set(
        normalizedOwnedShops.map(
          (shop) => shop.countrySlug,
        ),
      ),
    );

    if (normalizedCountries.length > 1) {
      return NextResponse.json(
        {
          error:
            'Canadian and Indian marketplace balances must be paid separately.',
        },
        { status: 400 },
      );
    }

    const countrySlug =
      normalizedCountries[0] === 'india'
        ? 'india'
        : 'canada';

    const stripeCurrency =
      countrySlug === 'india' ? 'inr' : 'cad';

    if (shopIds.length === 0) {
      return NextResponse.json(
        {
          error:
            'No approved shops were found for this account.',
        },
        { status: 400 },
      );
    }

    const {
      data: payableEntries,
      error: payableEntriesError,
    } = await supabaseServer
      .from('service_fee_ledger')
      .select(`
        id,
        shop_id,
        amount,
        status
      `)
      .in('shop_id', shopIds)
      .in('status', PAYABLE_LEDGER_STATUSES)
      .order('created_at', { ascending: true });

    if (payableEntriesError) {
      return NextResponse.json(
        { error: payableEntriesError.message },
        { status: 500 },
      );
    }

    const ledgerEntries = payableEntries || [];

    if (ledgerEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            'There is no unpaid marketplace balance.',
        },
        { status: 400 },
      );
    }

    const ledgerEntryIds = ledgerEntries.map(
      (entry: { id: string }) => entry.id,
    );

    const amount = ledgerEntries.reduce(
      (
        total: number,
        entry: { amount: number | string },
      ) => total + (Number(entry.amount) || 0),
      0,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'The unpaid marketplace balance is invalid.',
        },
        { status: 500 },
      );
    }

    const amountInCents = Math.round(amount * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        {
          error:
            'The current balance is below Stripe’s minimum card charge. Please wait for more fees or the monthly invoice.',
        },
        { status: 400 },
      );
    }

    const {
      data: paymentSession,
      error: paymentSessionError,
    } = await supabaseServer
      .from('marketplace_payment_sessions')
      .insert({
        owner_user_id: user.id,
        shop_id:
          shopIds.length === 1
            ? shopIds[0]
            : null,
        amount,
        currency: stripeCurrency,
        status: 'created',
        ledger_entry_ids: ledgerEntryIds,
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        amount,
        currency,
        status
      `)
      .single();

    if (paymentSessionError) {
      return NextResponse.json(
        { error: paymentSessionError.message },
        { status: 500 },
      );
    }

    localPaymentSessionId =
      paymentSession.id;

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: stripeCurrency,
              unit_amount: amountInCents,
              product_data: {
                name:
                  'LocalStreetShop Marketplace Balance',
                description:
                  `${ledgerEntries.length} unpaid marketplace ${
                    ledgerEntries.length === 1
                      ? 'service fee'
                      : 'service fees'
                  } across your owned shops.`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentSessionId:
            paymentSession.id,
          ownerUserId: user.id,
          paymentType:
            'marketplace_balance',
          countrySlug,
          currency: stripeCurrency,
          ledgerEntryCount:
            String(ledgerEntryIds.length),
        },
        client_reference_id:
          paymentSession.id,
        success_url:
          `${siteUrl}/shop-owner/billing/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          `${siteUrl}/shop-owner/billing?payment=cancelled`,
      });

    if (!checkoutSession.url) {
      throw new Error(
        'Stripe did not return a Checkout URL.',
      );
    }

    const {
      error: updateSessionError,
    } = await supabaseServer
      .from('marketplace_payment_sessions')
      .update({
        stripe_checkout_session_id:
          checkoutSession.id,
        status: 'checkout_open',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentSession.id);

    if (updateSessionError) {
      throw updateSessionError;
    }

    return NextResponse.json({
      url: checkoutSession.url,
      paymentSessionId:
        paymentSession.id,
      amount,
      ledgerEntryCount:
        ledgerEntryIds.length,
    });
  } catch (error) {
    console.error(
      'Marketplace billing checkout error:',
      error,
    );

    if (localPaymentSessionId) {
      try {
        const {
          supabaseServer,
        } = getSupabaseClients();

        await supabaseServer
          .from('marketplace_payment_sessions')
          .update({
            status: 'failed',
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', localPaymentSessionId)
          .neq('status', 'paid');
      } catch (cleanupError) {
        console.error(
          'Unable to mark failed marketplace payment session:',
          cleanupError,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create billing Checkout session.',
      },
      { status: 500 },
    );
  }
}