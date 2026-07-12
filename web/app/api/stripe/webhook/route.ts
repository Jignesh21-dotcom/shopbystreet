import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

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
      'SUPABASE_SERVICE_ROLE_KEY is required for Stripe webhooks.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getPaymentIntentId(
  session: Stripe.Checkout.Session,
) {
  if (!session.payment_intent) return null;

  return typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent.id;
}

async function completeMarketplacePayment(
  session: Stripe.Checkout.Session,
) {
  if (
    session.metadata?.paymentType !==
    'marketplace_balance'
  ) {
    return;
  }

  if (session.payment_status !== 'paid') {
    console.warn(
      `Checkout Session ${session.id} completed without paid status.`,
    );
    return;
  }

  const paymentSessionId =
    session.metadata?.paymentSessionId;

  const paymentIntentId =
    getPaymentIntentId(session);

  const amountTotal = session.amount_total;
  const currency = session.currency;

  if (
    !paymentSessionId ||
    !paymentIntentId ||
    amountTotal === null ||
    !currency
  ) {
    throw new Error(
      'Marketplace Checkout Session is missing required payment data.',
    );
  }

  const supabaseServer = createServerClient();

  const { data, error } = await supabaseServer.rpc(
    'complete_marketplace_payment',
    {
      p_payment_session_id: paymentSessionId,
      p_stripe_checkout_session_id: session.id,
      p_stripe_payment_intent_id: paymentIntentId,
      p_amount_total_cents: amountTotal,
      p_currency: currency,
    },
  );

  if (error) {
    throw error;
  }

  console.log(
    'Marketplace payment completed:',
    data,
  );
}

async function expireMarketplacePayment(
  session: Stripe.Checkout.Session,
) {
  if (
    session.metadata?.paymentType !==
    'marketplace_balance'
  ) {
    return;
  }

  const paymentSessionId =
    session.metadata?.paymentSessionId;

  if (!paymentSessionId) return;

  const supabaseServer = createServerClient();

  const { error } = await supabaseServer
    .from('marketplace_payment_sessions')
    .update({
      status: 'expired',
      expired_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentSessionId)
    .eq('stripe_checkout_session_id', session.id)
    .neq('status', 'paid');

  if (error) {
    throw error;
  }
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not initialized.' },
      { status: 500 },
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          'STRIPE_WEBHOOK_SECRET is not configured.',
      },
      { status: 500 },
    );
  }

  const signature =
    req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Stripe signature is missing.' },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error(
      'Stripe webhook signature verification failed:',
      error,
    );

    return NextResponse.json(
      { error: 'Invalid Stripe signature.' },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await completeMarketplacePayment(session);
        break;
      }

      case 'checkout.session.expired': {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await expireMarketplacePayment(session);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      `Stripe webhook processing failed for ${event.id}:`,
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Webhook processing failed.',
      },
      { status: 500 },
    );
  }
}