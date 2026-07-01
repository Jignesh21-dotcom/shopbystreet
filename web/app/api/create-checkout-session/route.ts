import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const foundingBusinessPriceId = process.env.STRIPE_FOUNDING_BUSINESS_PRICE_ID;

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

  if (!foundingBusinessPriceId) {
    return NextResponse.json(
      { error: 'Stripe founding business price ID is missing' },
      { status: 500 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: foundingBusinessPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/shop-owner/payment-success`,
      cancel_url: `${siteUrl}/shop-owner`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session creation error:', err.message);

    return NextResponse.json(
      { error: 'Failed to create Stripe session' },
      { status: 500 }
    );
  }
}