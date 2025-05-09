import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Suppress Stripe's type version conflict using ts-expect-error
// @ts-expect-error Stripe type version mismatch - safe to ignore
const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1RL9ocBZgvjk1IFcSIceAEHO', // ✅ replace with your real Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop-owner`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create Stripe session' },
      { status: 500 }
    );
  }
}
