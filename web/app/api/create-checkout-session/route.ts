import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Initialize Stripe only at runtime
let stripe: Stripe | null = null;

if (typeof process.env.STRIPE_SECRET_KEY === 'string') {
  console.log('✅ STRIPE_SECRET_KEY loaded in server environment');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
} else {
  console.error('❌ STRIPE_SECRET_KEY is missing or invalid');
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
      console.warn('⚠️ Email is missing in request body');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ Debug: Confirm env values are loaded correctly
    console.log('🔑 Using STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY?.slice(0, 10) + '...');
    console.log('🌍 Using NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1RL9GyBZgvjk1IFc9eXHZ5Qy', // ✅ Replace with your live price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner`,
    });

    console.log('✅ Stripe session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('❌ Stripe session creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create Stripe session', details: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
