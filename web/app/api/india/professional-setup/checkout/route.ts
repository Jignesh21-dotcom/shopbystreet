import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.localstreetshop.com';

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

const PROFESSIONAL_SETUP_PRICE_IN_PAISE = 129900;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not initialized.' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body?.email === 'string'
        ? body.email.trim()
        : '';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'inr',
            unit_amount: PROFESSIONAL_SETUP_PRICE_IN_PAISE,
            product_data: {
              name: 'LocalStreetShop India — Professional Store Setup',
              description:
                'One-time assistance preparing a business profile and product showcase.',
            },
          },
        },
      ],
      metadata: {
        paymentPurpose: 'india_professional_store_setup',
        country: 'india',
        amountInr: '1299',
      },
      payment_intent_data: {
        metadata: {
          paymentPurpose: 'india_professional_store_setup',
          country: 'india',
          amountInr: '1299',
        },
      },
      success_url: `${siteUrl}/countries/india/business-owners/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/countries/india/business-owners?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('India professional setup checkout error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the Stripe Checkout session.',
      },
      { status: 500 },
    );
  }
}
