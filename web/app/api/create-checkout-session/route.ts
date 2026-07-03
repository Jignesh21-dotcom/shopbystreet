import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const growthShowcasePriceId = 'price_1TpAMaBZgvjk1IFcH1eUjYQ7';
const premiumMainStreetPriceId = 'price_1TpAMyBZgvjk1IFcqKiKJ4Hv';
const growthAmbassadorCouponId = process.env.STRIPE_GROWTH_AMBASSADOR_COUPON_ID;
const premiumAmbassadorCouponId = process.env.STRIPE_PREMIUM_AMBASSADOR_COUPON_ID;

const TIER_CONFIG = {
  growth: {
    priceId: growthShowcasePriceId,
    productLimit: 20,
  },
  premium: {
    priceId: premiumMainStreetPriceId,
    productLimit: null,
  },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

const COUPON_CODE_MAP: Record<TierKey, { code: string; couponId?: string }> = {
  growth: {
    code: 'AMBASSADOR',
    couponId: growthAmbassadorCouponId,
  },
  premium: {
    code: 'PREMIUMAMBASSADOR',
    couponId: premiumAmbassadorCouponId,
  },
};

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not initialized' },
      { status: 500 }
    );
  }

  if (!siteUrl) {
    return NextResponse.json(
      { error: 'Site URL is not configured' },
      { status: 500 }
    );
  }

  try {
    const { email, tier, couponCode } = await req.json();

    const selectedTier = `${tier || ''}`.toLowerCase() as TierKey;
    const tierConfig = TIER_CONFIG[selectedTier];
    const normalizedCouponCode = `${couponCode || ''}`.trim().toUpperCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!tierConfig) {
      return NextResponse.json(
        { error: 'Invalid pricing tier selected.' },
        { status: 400 }
      );
    }

    if (!tierConfig.priceId) {
      return NextResponse.json(
        { error: `Stripe price ID is missing for tier: ${selectedTier}` },
        { status: 500 }
      );
    }

    let checkoutDiscounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

    if (normalizedCouponCode) {
      const expectedCoupon = COUPON_CODE_MAP[selectedTier];

      if (!expectedCoupon || normalizedCouponCode !== expectedCoupon.code) {
        return NextResponse.json(
          {
            error:
              selectedTier === 'growth'
                ? 'Invalid code for Growth Showcase. Use AMBASSADOR.'
                : 'Invalid code for Premium Main Street. Use PREMIUMAMBASSADOR.',
          },
          { status: 400 }
        );
      }

      if (!expectedCoupon.couponId) {
        return NextResponse.json(
          {
            error: `Coupon is not configured for tier: ${selectedTier}.`,
          },
          { status: 500 }
        );
      }

      checkoutDiscounts = [{ coupon: expectedCoupon.couponId }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      allow_promotion_codes: true,
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      discounts: checkoutDiscounts,
      metadata: {
        tier: selectedTier,
        ambassadorCode: normalizedCouponCode || '',
        productLimit:
          tierConfig.productLimit === null ? 'unlimited' : `${tierConfig.productLimit}`,
      },
      success_url: `${siteUrl}/shop-owner/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session creation error:', err.message);

    return NextResponse.json(
      { error: err?.message || 'Failed to create Stripe session' },
      { status: 500 }
    );
  }
}