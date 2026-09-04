import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

type RouteContext = { params: Promise<{ id: string }> };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getSiteUrl = (request: Request) => {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!configuredUrl) return new URL(request.url).origin;
  const url = configuredUrl.startsWith('http')
    ? configuredUrl
    : `https://${configuredUrl}`;
  return url.replace(/\/+$/, '');
};

async function getClients(request: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = (request.headers.get('authorization') || '')
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!url || !anon || !service || !token) return null;

  const auth = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userResult, error: userError } = await auth.auth.getUser(token);
  if (userError || !userResult.user) return null;

  const { data: isAdmin, error: adminError } = await auth.rpc('is_admin');
  if (adminError || !isAdmin) return null;

  return {
    user: userResult.user,
    admin: createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const clients = await getClients(request);
    if (!clients) {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Shop ID is required.' }, { status: 400 });
    }

    const { data: shop, error: shopError } = await clients.admin
      .from('shops')
      .select(`
        id, name, slug, address, approved, owner_id,
        street:street_id (name, slug, city:city_id (name, slug))
      `)
      .eq('id', id)
      .maybeSingle();

    if (shopError) {
      return NextResponse.json({ error: shopError.message }, { status: 500 });
    }
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    if (!shop.approved) {
      const { data: updated, error: updateError } = await clients.admin
        .from('shops')
        .update({ approved: true })
        .eq('id', id)
        .eq('approved', false)
        .select('id')
        .maybeSingle();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      if (!updated) {
        return NextResponse.json(
          { error: 'The shop was not updated. Refresh and try again.' },
          { status: 409 },
        );
      }
    }

    let warning: string | null = null;
    if (!shop.owner_id) {
      warning = 'Shop approved, but it has no owner account to notify.';
    } else {
      const { data: ownerResult, error: ownerError } =
        await clients.admin.auth.admin.getUserById(shop.owner_id);
      const ownerEmail = ownerResult.user?.email;
      const smtpUser = process.env.CONTACT_SMTP_USER;
      const smtpPass = process.env.CONTACT_SMTP_PASS;

      if (ownerError || !ownerEmail) {
        warning = 'Shop approved, but the owner email could not be resolved.';
      } else if (!smtpUser || !smtpPass) {
        warning = 'Shop approved, but SMTP is not configured.';
      } else {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: { user: smtpUser, pass: smtpPass },
        });
        const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;
        const siteUrl = getSiteUrl(request);
        const dashboardUrl = `${siteUrl}/shop-owner/dashboard`;

        try {
          await transporter.sendMail({
            from: `"LocalStreetShop Support" <${fromEmail}>`,
            to: ownerEmail,
            replyTo: fromEmail,
            subject: 'Your shop has been approved — LocalStreetShop',
            text: [
              `Great news — ${shop.name} has been approved.`,
              '',
              'Your shop can now appear publicly on LocalStreetShop.',
              `Dashboard: ${dashboardUrl}`,
            ].join('\n'),
            html: `
              <h2>Your shop has been approved</h2>
              <p>Great news — <strong>${escapeHtml(shop.name)}</strong> has been approved.</p>
              <p>Your shop can now appear publicly on LocalStreetShop. You can manage its information, photos, products, and settings from your dashboard.</p>
              <p><a href="${escapeHtml(dashboardUrl)}">Open your Shop Owner Dashboard</a></p>
            `,
          });
        } catch (emailError) {
          console.error('Shop approval email failed:', emailError);
          warning = 'Shop approved, but the approval email could not be sent.';
        }
      }
    }

    return NextResponse.json({ success: true, warning });
  } catch (error) {
    console.error('Approve shop API error:', error);
    return NextResponse.json({ error: 'Unable to approve this shop.' }, { status: 500 });
  }
}
