import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Specify the API version explicitly
});

export async function POST(req: Request) {
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
          price: 'price_1RL9ocBZgvjk1IFcSIceAEHO', // Replace with your real Price ID from Stripe
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