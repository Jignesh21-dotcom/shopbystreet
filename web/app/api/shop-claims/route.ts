import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

type ClaimPayload = {
  shopId?: unknown;
  message?: unknown;
};

const MAX_MESSAGE_LENGTH = 2000;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export async function POST(req: Request) {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error('Missing required Supabase environment variables.');

      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization');

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const authClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: authData,
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email?.trim();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Your account does not have a valid email address.' },
        { status: 400 }
      );
    }

    const body = (await req.json()) as ClaimPayload;

    const shopId = getString(body.shopId);
    const message = getString(body.message);

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required.' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: shop, error: shopError } =
      await supabaseAdmin
        .from('shops')
        .select(`
          id,
          name,
          address,
          owner_id,
          street:street_id (
            name,
            city:city_id (
              name
            )
          )
        `)
        .eq('id', shopId)
        .maybeSingle();

    if (shopError) {
      console.error('Claim shop lookup failed:', shopError);

      return NextResponse.json(
        { error: 'Unable to verify this shop.' },
        { status: 500 }
      );
    }

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found.' },
        { status: 404 }
      );
    }

    if (shop.owner_id) {
      return NextResponse.json(
        { error: 'This shop has already been claimed.' },
        { status: 409 }
      );
    }

    const { data: existingClaim, error: existingClaimError } =
      await supabaseAdmin
        .from('shop_claims')
        .select('id, shop_id, status')
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

    if (existingClaimError) {
      console.error(
        'Existing claim lookup failed:',
        existingClaimError
      );

      return NextResponse.json(
        { error: 'Unable to check existing claims.' },
        { status: 500 }
      );
    }

    if (existingClaim) {
      return NextResponse.json({
        success: true,
        claim: existingClaim,
        alreadyExists: true,
      });
    }

    const { data: claim, error: claimError } =
      await supabaseAdmin
        .from('shop_claims')
        .insert({
          shop_id: shopId,
          user_id: userId,
          message: message || null,
          status: 'pending',
        })
        .select('id, shop_id, status')
        .single();

    if (claimError) {
      console.error('Claim insert failed:', claimError);

      return NextResponse.json(
        { error: claimError.message },
        { status: 500 }
      );
    }

    const shopStreet = Array.isArray(shop.street)
      ? shop.street[0] || null
      : shop.street;

    const shopCityRaw = shopStreet?.city;

    const shopCity = Array.isArray(shopCityRaw)
      ? shopCityRaw[0] || null
      : shopCityRaw;

    const shopName = shop.name || 'Unknown shop';
    const shopAddress = shop.address || 'Not provided';
    const streetName = shopStreet?.name || 'Not provided';
    const cityName = shopCity?.name || 'Not provided';

    if (
      process.env.CONTACT_SMTP_USER &&
      process.env.CONTACT_SMTP_PASS
    ) {
      const safeShopName = escapeHtml(shopName);
      const safeUserEmail = escapeHtml(userEmail);
      const safeMessage = escapeHtml(
        message || 'No message provided.'
      ).replace(/\r?\n/g, '<br />');
      const safeAddress = escapeHtml(shopAddress);
      const safeCity = escapeHtml(cityName);
      const safeStreet = escapeHtml(streetName);

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.CONTACT_SMTP_USER,
          pass: process.env.CONTACT_SMTP_PASS,
        },
      });

      const claimsRecipient =
        process.env.CLAIMS_NOTIFICATION_TO ||
        process.env.CONTACT_SMTP_USER;

      const fromEmail =
        process.env.CONTACT_FROM_EMAIL ||
        process.env.CONTACT_SMTP_USER;

      try {
        await transporter.sendMail({
          from: `"LocalStreetShop Support" <${fromEmail}>`,
          to: claimsRecipient,
          replyTo: userEmail,
          subject: `New Shop Claim Request: ${shopName}`,
          text: [
            'New Shop Claim Request',
            '',
            `Shop: ${shopName}`,
            `Address: ${shopAddress}`,
            `City: ${cityName}`,
            `Street: ${streetName}`,
            `Requested by: ${userEmail}`,
            '',
            'Owner message:',
            message || 'No message provided.',
          ].join('\n'),
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
          subject:
            'Your shop claim request was received — LocalStreetShop',
          text: [
            'Claim request received',
            '',
            `We received your request to claim ${shopName}.`,
            '',
            'Our team will review your request and email you once your access is approved.',
            '',
            'Thank you,',
            'The LocalStreetShop Team',
          ].join('\n'),
          html: `
            <h2>Claim request received</h2>

            <p>Hi,</p>

            <p>
              We received your request to claim
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
      } catch (emailError) {
        // The claim is already safely stored.
        // Do not make the user resubmit because an email failed.
        console.error('Shop claim email failed:', emailError);
      }
    } else {
      console.error(
        'Claim saved, but SMTP environment variables are missing.'
      );
    }

    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    console.error('Shop claim API error:', error);

    return NextResponse.json(
      { error: 'Unable to submit claim request.' },
      { status: 500 }
    );
  }
}