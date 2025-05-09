import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Initialize Stripe only at runtime
let stripe: Stripe | null = null;

if (typeof process.env.STRIPE_SECRET_KEY === 'string') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
} else {
  console.error('STRIPE_SECRET_KEY is missing');
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not initialized' },
      { status: 500 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1RL9ocBZgvjk1IFcSIceAEHO',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('❌ Stripe session creation error:', err.message || err);
    return NextResponse.json(
      { error: 'Failed to create Stripe session' },
      { status: 500 }
    );
  }
}