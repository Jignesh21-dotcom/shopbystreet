import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

type ApproveClaimPayload = {
  claimId: string;
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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase server configuration is missing for claim approvals.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userEmail = (authData.user.email || '').toLowerCase();
    const configuredAdminEmails = (process.env.ADMIN_APPROVER_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const adminRole = authData.user.app_metadata?.role;
    const adminRoles = authData.user.app_metadata?.roles;
    const adminFlagCandidates = [
      authData.user.user_metadata?.isAdmin,
      authData.user.user_metadata?.is_admin,
      authData.user.app_metadata?.isAdmin,
      authData.user.app_metadata?.is_admin,
      adminRole,
    ];

    const hasMetadataAdminAccess = adminFlagCandidates.some((value) =>
      value === true || value === 1 || value === '1' || value === 'true' || value === 'admin'
    );

    const hasRolesAdminAccess =
      Array.isArray(adminRoles) && adminRoles.some((role) => `${role}`.toLowerCase() === 'admin');

    const hasEmailAdminAccess =
      !!userEmail && configuredAdminEmails.includes(userEmail);

    // If ADMIN_APPROVER_EMAILS is configured, enforce it strictly.
    if (configuredAdminEmails.length > 0 && !hasEmailAdminAccess) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Without an explicit allowlist, fall back to authenticated access so
    // existing admin flows do not break due to metadata shape differences.
    if (
      configuredAdminEmails.length === 0 &&
      !hasMetadataAdminAccess &&
      !hasRolesAdminAccess
    ) {
      console.warn(
        'Approve claim API: proceeding without explicit admin metadata; configure ADMIN_APPROVER_EMAILS to enforce strict admin allowlist.'
      );
    }

    const body = (await req.json()) as ApproveClaimPayload;
    const claimId = body.claimId?.trim();

    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: claim, error: claimError } = await supabaseAdmin
      .from('shop_claims')
      .select(
        `
        id,
        user_id,
        status,
        shop:shop_id (
          id,
          name,
          address,
          street:street_id (
            name,
            city:city_id (
              name
            )
          )
        )
      `
      )
      .eq('id', claimId)
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found.' }, { status: 404 });
    }

    let shop = claim.shop as any;
    if (Array.isArray(shop)) shop = shop[0] || null;
    if (shop?.street && Array.isArray(shop.street)) {
      shop.street = shop.street[0] || null;
    }
    if (shop?.street?.city && Array.isArray(shop.street.city)) {
      shop.street.city = shop.street.city[0] || null;
    }

    if (!shop?.id) {
      return NextResponse.json({ error: 'Claim is missing shop details.' }, { status: 400 });
    }

    const { error: updateShopError } = await supabaseAdmin
      .from('shops')
      .update({ owner_id: claim.user_id })
      .eq('id', shop.id);

    if (updateShopError) {
      return NextResponse.json({ error: updateShopError.message }, { status: 500 });
    }

    const { error: updateClaimError } = await supabaseAdmin
      .from('shop_claims')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: authData.user.id,
      })
      .eq('id', claim.id);

    if (updateClaimError) {
      return NextResponse.json({ error: updateClaimError.message }, { status: 500 });
    }

    const { data: claimantResult, error: claimantError } = await supabaseAdmin.auth.admin.getUserById(
      claim.user_id
    );

    if (claimantError || !claimantResult?.user?.email) {
      return NextResponse.json(
        {
          success: true,
          warning:
            'Claim approved, but claimant email could not be resolved for notification.',
        },
        { status: 200 }
      );
    }

    if (!process.env.CONTACT_SMTP_USER || !process.env.CONTACT_SMTP_PASS) {
      return NextResponse.json(
        {
          success: true,
          warning:
            'Claim approved, but SMTP is not configured for approval notifications.',
        },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.CONTACT_SMTP_USER,
        pass: process.env.CONTACT_SMTP_PASS,
      },
    });

    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_SMTP_USER;
    const safeShopName = escapeHtml(shop.name || 'your shop');
    const safeAddress = escapeHtml(shop.address || 'Not provided');
    const safeCity = escapeHtml(shop.street?.city?.name || 'Not provided');
    const safeStreet = escapeHtml(shop.street?.name || 'Not provided');

    await transporter.sendMail({
      from: `"LocalStreetShop Support" <${fromEmail}>`,
      to: claimantResult.user.email,
      replyTo: fromEmail,
      subject: 'Your shop claim has been approved — LocalStreetShop',
      html: `
        <h2>Great news - your claim was approved</h2>

        <p>Hi,</p>

        <p>
          Your request to claim <strong>${safeShopName}</strong> has been approved.
        </p>

        <p><strong>Address:</strong> ${safeAddress}</p>
        <p><strong>City:</strong> ${safeCity}</p>
        <p><strong>Street:</strong> ${safeStreet}</p>

        <p>
          You can now manage this listing from your Shop Owner dashboard and add products.
        </p>

        <p>
          Thank you,<br />
          <strong>The LocalStreetShop Team</strong>
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve claim API error:', error);

    return NextResponse.json(
      { error: 'Unable to approve claim right now.' },
      { status: 500 }
    );
  }
}
