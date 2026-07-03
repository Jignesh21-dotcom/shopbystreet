import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

type ActivateTierPayload = {
  sessionId: string;
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

const parseLimit = (value: string | undefined): number | null => {
  if (!value) return null;
  if (value === 'unlimited') return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
};

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not initialized.' }, { status: 500 });
    }

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase server configuration is missing.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await req.json()) as ActivateTierPayload;
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed yet.' },
        { status: 400 }
      );
    }

    const paidEmail = (checkoutSession.customer_details?.email || checkoutSession.customer_email || '').toLowerCase();
    const currentEmail = (authData.user.email || '').toLowerCase();

    if (!paidEmail || !currentEmail || paidEmail !== currentEmail) {
      return NextResponse.json(
        { error: 'Payment session does not belong to the current user.' },
        { status: 403 }
      );
    }

    const tier = checkoutSession.metadata?.tier || 'growth';
    const productLimitRaw = checkoutSession.metadata?.productLimit;
    const productLimit = parseLimit(productLimitRaw);

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: updatedUser, error: updateUserError } = await adminClient.auth.admin.updateUserById(
      authData.user.id,
      {
        user_metadata: {
          ...authData.user.user_metadata,
          shopStatus: 'active',
          pricingTier: tier,
          productLimit: productLimit,
          paymentActivatedAt: new Date().toISOString(),
          lastPaidCheckoutSessionId: sessionId,
        },
      }
    );

    if (updateUserError) {
      return NextResponse.json({ error: updateUserError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tier,
      productLimit,
      email: updatedUser.user?.email,
    });
  } catch (error) {
    console.error('Activate tier API error:', error);

    return NextResponse.json(
      { error: 'Unable to activate paid tier.' },
      { status: 500 }
    );
  }
}
