import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-04-30.basil",
    })
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not initialized" },
      { status: 500 }
    );
  }

  if (!siteUrl) {
    return NextResponse.json(
      { error: "Site URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const amountValue = formData.get("amount");

    const amount = Number(amountValue);

    if (!amount || Number.isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { error: "Please enter a valid support amount of at least $1." },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Support LocalStreetShop",
              description: "Help build Canada's Digital Main Street.",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "donation",
        project: "LocalStreetShop",
        amount: `${amount}`,
      },
      success_url: `${siteUrl}/support/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/support`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout URL was not created." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error("Donation checkout error:", err.message);

    return NextResponse.json(
      { error: err?.message || "Failed to create donation checkout session." },
      { status: 500 }
    );
  }
}