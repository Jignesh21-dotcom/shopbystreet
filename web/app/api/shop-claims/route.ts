import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

type ClaimPayload = {
  shopId: string;
  shopName: string;
  shopAddress?: string | null;
  shopCity?: string | null;
  shopStreet?: string | null;
  message?: string | null;
  userId: string;
  userEmail: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ClaimPayload;

    const shopId = body.shopId?.trim();
    const shopName = body.shopName?.trim();
    const userId = body.userId?.trim();
    const userEmail = body.userEmail?.trim();
    const message = body.message?.trim() || '';

    if (!shopId || !shopName || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required claim information.' },
        { status: 400 }
      );
    }

    if (!process.env.CONTACT_SMTP_USER || !process.env.CONTACT_SMTP_PASS) {
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const supabaseServer =
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : supabase;

    const { data: existingClaim } = await supabaseServer
      .from('shop_claims')
      .select('id, shop_id, status')
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json({
        success: true,
        claim: existingClaim,
        alreadyExists: true,
      });
    }

    const { data: claim, error: claimError } = await supabaseServer
      .from('shop_claims')
      .insert([
        {
          shop_id: shopId,
          user_id: userId,
          message,
          status: 'pending',
        },
      ])
      .select('id, shop_id, status')
      .single();

    if (claimError) {
      return NextResponse.json(
        { error: claimError.message },
        { status: 500 }
      );
    }

    const safeShopName = escapeHtml(shopName);
    const safeUserEmail = escapeHtml(userEmail);
    const safeMessage = escapeHtml(message || 'No message provided.').replace(
      /\n/g,
      '<br />'
    );
    const safeAddress = escapeHtml(body.shopAddress || 'Not provided');
    const safeCity = escapeHtml(body.shopCity || 'Not provided');
    const safeStreet = escapeHtml(body.shopStreet || 'Not provided');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.CONTACT_SMTP_USER,
        pass: process.env.CONTACT_SMTP_PASS,
      },
    });

    const claimsRecipient =
      process.env.CLAIMS_NOTIFICATION_TO || process.env.CONTACT_SMTP_USER;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_SMTP_USER;

    await transporter.sendMail({
      from: `"LocalStreetShop Support" <${fromEmail}>`,
      to: claimsRecipient,
      replyTo: userEmail,
      subject: `New Shop Claim Request: ${shopName}`,
      html: `
        <h2>New Shop Claim Request</h2>
        <p><strong>Shop:</strong> ${safeShopName}</p>
        <p><strong>Address:</strong> ${safeAddress}</p>
        <p><strong>City:</strong> ${safeCity}</p>
        <p><strong>Street:</strong> ${safeStreet}</p>
        <p><strong>Requested by:</strong> ${safeUserEmail}</p>

        <p><strong>Owner message:</strong></p>
        <p>${safeMessage}</p>

        <p>
          Review this request in the LocalStreetShop admin claims dashboard.
        </p>
      `,
    });

    await transporter.sendMail({
      from: `"LocalStreetShop Support" <${fromEmail}>`,
      to: userEmail,
      replyTo: fromEmail,
      subject: 'Your shop claim request was received — LocalStreetShop',
      html: `
        <h2>Claim request received</h2>

        <p>Hi,</p>

        <p>
          We received your request to claim:
          <strong>${safeShopName}</strong>.
        </p>

        <p>
          Our team will review your request and email you once your access is approved.
        </p>

        <p>
          Thank you,<br />
          <strong>The LocalStreetShop Team</strong>
        </p>
      `,
    });

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    console.error('Shop claim API error:', error);

    return NextResponse.json(
      { error: 'Unable to submit claim request.' },
      { status: 500 }
    );
  }
}