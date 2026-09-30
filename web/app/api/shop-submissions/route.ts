import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

type SubmitShopPayload = {
  name?: unknown;
  slug?: unknown;
  address?: unknown;
  description?: unknown;
  parking?: unknown;
  countryId?: unknown;
  provinceId?: unknown;
  cityId?: unknown;
  streetId?: unknown;
  streetName?: unknown;
};

const getString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

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

export async function POST(request: Request) {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 },
      );
    }

    const authorization = request.headers.get('authorization') || '';
    const token = authorization.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } =
      await authClient.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await request.json()) as SubmitShopPayload;
    const name = getString(body.name);
    const requestedSlug = slugify(getString(body.slug) || name);
    const address = getString(body.address);
    const description = getString(body.description);
    const parking = getString(body.parking);
    const countryId = getString(body.countryId);
    const provinceId = getString(body.provinceId);
    const cityId = getString(body.cityId);
    const streetId = getString(body.streetId);
    const submittedStreetName = getString(body.streetName);

    if (
      !name ||
      !requestedSlug ||
      !address ||
      !countryId ||
      !provinceId ||
      !cityId
    ) {
      return NextResponse.json(
        {
          error:
            'Shop name, address, country, province, city, and street are required.',
        },
        { status: 400 },
      );
    }

    if (name.length > 200 || requestedSlug.length > 220 || address.length > 500) {
      return NextResponse.json(
        { error: 'One or more submitted fields are too long.' },
        { status: 400 },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [countryResult, provinceResult, cityResult] = await Promise.all([
      admin.from('countries').select('id, name, slug').eq('id', countryId).maybeSingle(),
      admin.from('provinces').select('id, name, slug, country_id').eq('id', provinceId).maybeSingle(),
      admin.from('cities').select('id, name, slug, province_id').eq('id', cityId).maybeSingle(),
    ]);

    const locationError = countryResult.error || provinceResult.error || cityResult.error;
    if (locationError) {
      return NextResponse.json({ error: `Unable to verify the selected location: ${locationError.message}` }, { status: 500 });
    }

    const country = countryResult.data;
    const province = provinceResult.data;
    const city = cityResult.data;
    if (!country || !province || !city || province.country_id !== country.id || city.province_id !== province.id) {
      return NextResponse.json({ error: 'The selected country, province, and city do not match.' }, { status: 400 });
    }

    const isCanada = country.slug === 'canada';
    if (isCanada && !submittedStreetName) {
      return NextResponse.json({ error: 'Please enter the street or road from the official business address.' }, { status: 400 });
    }
    if (!isCanada && !streetId) {
      return NextResponse.json({ error: 'Please select a street.' }, { status: 400 });
    }

    let street: { id: string; name: string; city_id: string } | null = null;
    if (!isCanada) {
      const streetResult = await admin.from('streets').select('id, name, city_id').eq('id', streetId).maybeSingle();
      if (streetResult.error) return NextResponse.json({ error: streetResult.error.message }, { status: 500 });
      street = streetResult.data;
      if (!street || street.city_id !== city.id) {
        return NextResponse.json({ error: 'The selected street does not match the selected city.' }, { status: 400 });
      }
    }

    const { data: existingSubmission, error: duplicateError } = await admin
      .from('shops')
      .select('id, name, approved')
      .eq('owner_id', authData.user.id)
      .eq('city_id', cityId)
      .ilike('name', name)
      .ilike('address', address)
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return NextResponse.json(
        { error: `Unable to check existing submissions: ${duplicateError.message}` },
        { status: 500 },
      );
    }

    if (existingSubmission) {
      return NextResponse.json(
        {
          error: existingSubmission.approved
            ? 'This shop is already approved and available in your dashboard.'
            : 'This shop is already awaiting administrator approval.',
          shopId: existingSubmission.id,
        },
        { status: 409 },
      );
    }

    let finalSlug = requestedSlug;
    const { data: slugMatch, error: slugError } = await admin
      .from('shops')
      .select('id')
      .eq('slug', finalSlug)
      .limit(1)
      .maybeSingle();

    if (slugError) {
      return NextResponse.json(
        { error: `Unable to verify the shop URL: ${slugError.message}` },
        { status: 500 },
      );
    }

    if (slugMatch) {
      finalSlug = `${requestedSlug}-${crypto.randomUUID().slice(0, 8)}`;
    }

    const { data: shop, error: insertError } = await admin
      .from('shops')
      .insert({
        name,
        slug: finalSlug,
        street_id: isCanada ? null : streetId,
        submitted_street_name: isCanada ? submittedStreetName : null,
        city_id: cityId,
        province_id: provinceId,
        address,
        description: description || null,
        parking: parking || null,
        owner_id: authData.user.id,
        approved: false,
      })
      .select('id, name, slug, address, approved, created_at')
      .single();

    if (insertError || !shop) {
      return NextResponse.json(
        { error: insertError?.message || 'Unable to save the shop submission.' },
        { status: 500 },
      );
    }

    let emailWarning: string | null = null;
    const smtpUser = process.env.CONTACT_SMTP_USER;
    const smtpPass = process.env.CONTACT_SMTP_PASS;
    const ownerEmail = authData.user.email?.trim();

    if (!smtpUser || !smtpPass || !ownerEmail) {
      emailWarning =
        'Submission saved, but one or more notification emails could not be configured.';
    } else {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;
      const adminRecipient =
        process.env.SHOP_SUBMISSION_NOTIFICATION_TO || smtpUser;
      const siteUrl = getSiteUrl(request);
      const adminUrl = `${siteUrl}/admin/shops`;
      const dashboardUrl = `${siteUrl}/shop-owner/dashboard`;

      try {
        await transporter.sendMail({
          from: `"LocalStreetShop Support" <${fromEmail}>`,
          to: adminRecipient,
          replyTo: ownerEmail,
          subject: `New Shop Submission: ${name}`,
          text: [
            'A new shop is awaiting approval.',
            '',
            `Shop: ${name}`,
            `Owner: ${ownerEmail}`,
            `Address: ${address}`,
            `Street: ${isCanada ? submittedStreetName : street?.name || ''}`,
            `City: ${city.name}`,
            `Province: ${province.name}`,
            `Country: ${country.name}`,
            '',
            `Review: ${adminUrl}`,
          ].join('\n'),
          html: `
            <h2>New shop submission</h2>
            <p><strong>Shop:</strong> ${escapeHtml(name)}</p>
            <p><strong>Owner:</strong> ${escapeHtml(ownerEmail)}</p>
            <p><strong>Address:</strong> ${escapeHtml(address)}</p>
            <p><strong>Street:</strong> ${escapeHtml(isCanada ? submittedStreetName : street?.name || '')}</p>
            <p><strong>City:</strong> ${escapeHtml(city.name || '')}</p>
            <p><strong>Province:</strong> ${escapeHtml(province.name || '')}</p>
            <p><strong>Country:</strong> ${escapeHtml(country.name || '')}</p>
            <p><a href="${escapeHtml(adminUrl)}">Review pending shops</a></p>
          `,
        });

        await transporter.sendMail({
          from: `"LocalStreetShop Support" <${fromEmail}>`,
          to: ownerEmail,
          replyTo: fromEmail,
          subject: 'Your shop submission was received — LocalStreetShop',
          text: [
            `We received your submission for ${name}.`,
            '',
            'It is awaiting administrator review and is not public yet.',
            'We will email you after it has been approved or rejected.',
            '',
            `Dashboard: ${dashboardUrl}`,
          ].join('\n'),
          html: `
            <h2>Shop submission received</h2>
            <p>We received your submission for <strong>${escapeHtml(name)}</strong>.</p>
            <p>It is awaiting administrator review and is not public yet. We will email you after it has been reviewed.</p>
            <p><a href="${escapeHtml(dashboardUrl)}">Open your Shop Owner Dashboard</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Shop submission notification failed:', emailError);
        emailWarning =
          'Submission saved, but one or more notification emails could not be sent.';
      }
    }

    return NextResponse.json(
      { success: true, shop, warning: emailWarning },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create shop submission API error:', error);
    return NextResponse.json(
      { error: 'Unable to submit this shop right now.' },
      { status: 500 },
    );
  }
}
