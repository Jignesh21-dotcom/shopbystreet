import { NextResponse } from 'next/server';

export async function GET() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'Missing';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'Missing';

  return NextResponse.json({
    stripeSecretKey: stripeSecretKey ? 'Exists' : 'Missing',
    siteUrl: siteUrl ? 'Exists' : 'Missing',
  });
}