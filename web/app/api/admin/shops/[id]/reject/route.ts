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

async function getAdminClient(request: Request) {
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

  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminClient(request);
    if (!admin) {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { reason?: unknown };
    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, 1000)
        : 'The submitted shop information could not be approved.';

    const { data: shop, error: shopError } = await admin
      .from('shops')
      .select('id, name, approved, owner_id')
      .eq('id', id)
      .maybeSingle();

    if (shopError) return NextResponse.json({ error: shopError.message }, { status: 500 });
    if (!shop) return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    if (shop.approved) {
      return NextResponse.json({ error: 'Approved shops cannot be rejected here.' }, { status: 409 });
    }

    let ownerEmail: string | null = null;
    if (shop.owner_id) {
      const { data: ownerResult } = await admin.auth.admin.getUserById(shop.owner_id);
      ownerEmail = ownerResult.user?.email || null;
    }

    const { data: deleted, error: deleteError } = await admin
      .from('shops')
      .delete()
      .eq('id', id)
      .eq('approved', false)
      .select('id')
      .maybeSingle();

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    if (!deleted) {
      return NextResponse.json({ error: 'The pending shop was not deleted.' }, { status: 409 });
    }

    let warning: string | null = null;
    const smtpUser = process.env.CONTACT_SMTP_USER;
    const smtpPass = process.env.CONTACT_SMTP_PASS;

    if (ownerEmail && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: smtpUser, pass: smtpPass },
      });
      const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;

      try {
        await transporter.sendMail({
          from: `"LocalStreetShop Support" <${fromEmail}>`,
          to: ownerEmail,
          replyTo: fromEmail,
          subject: 'Update about your shop submission — LocalStreetShop',
          text: [
            `Your submission for ${shop.name} was not approved.`,
            '',
            `Reason: ${reason}`,
            '',
            'You may correct the information and submit it again, or reply to this email for assistance.',
          ].join('\n'),
          html: `
            <h2>Update about your shop submission</h2>
            <p>Your submission for <strong>${escapeHtml(shop.name)}</strong> was not approved.</p>
            <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
            <p>You may correct the information and submit it again, or reply to this email for assistance.</p>
          `,
        });
      } catch (emailError) {
        console.error('Shop rejection email failed:', emailError);
        warning = 'Submission removed, but the rejection email could not be sent.';
      }
    } else {
      warning = 'Submission removed, but the owner could not be notified.';
    }

    return NextResponse.json({ success: true, warning });
  } catch (error) {
    console.error('Reject shop API error:', error);
    return NextResponse.json({ error: 'Unable to reject this shop.' }, { status: 500 });
  }
}
