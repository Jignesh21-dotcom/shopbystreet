import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Clean Stripe initialization (let Stripe use default API version)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1RL9ocBZgvjk1IFcSIceAEHO', // ✅ replace with your real Price ID from Stripe
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
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}
