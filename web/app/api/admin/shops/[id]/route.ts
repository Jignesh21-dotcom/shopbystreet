import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RouteContext = { params: Promise<{ id: string }> };

type UpdateShopPayload = {
  name?: unknown;
  slug?: unknown;
  address?: unknown;
  description?: unknown;
  parking?: unknown;
  provinceId?: unknown;
  cityId?: unknown;
  streetId?: unknown;
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminClient(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Administrator access required.' },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateShopPayload;
    const name = getString(body.name);
    const slug = slugify(getString(body.slug) || name);
    const address = getString(body.address);
    const description = getString(body.description);
    const parking = getString(body.parking);
    const provinceId = getString(body.provinceId);
    const cityId = getString(body.cityId);
    const streetId = getString(body.streetId);

    if (!id || !name || !slug || !address || !provinceId || !cityId || !streetId) {
      return NextResponse.json(
        { error: 'Name, URL slug, full address, province, city, and street are required.' },
        { status: 400 },
      );
    }

    if (name.length > 200 || slug.length > 220 || address.length > 500) {
      return NextResponse.json(
        { error: 'One or more submitted fields are too long.' },
        { status: 400 },
      );
    }

    const [cityResult, streetResult, slugResult] = await Promise.all([
      admin.from('cities').select('id, province_id').eq('id', cityId).maybeSingle(),
      admin.from('streets').select('id, city_id').eq('id', streetId).maybeSingle(),
      admin.from('shops').select('id').eq('slug', slug).neq('id', id).limit(1).maybeSingle(),
    ]);

    const lookupError = cityResult.error || streetResult.error || slugResult.error;
    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (
      !cityResult.data ||
      !streetResult.data ||
      cityResult.data.province_id !== provinceId ||
      streetResult.data.city_id !== cityId
    ) {
      return NextResponse.json(
        { error: 'The selected province, city, and street do not match.' },
        { status: 400 },
      );
    }

    if (slugResult.data) {
      return NextResponse.json(
        { error: 'That shop URL is already in use. Please choose another slug.' },
        { status: 409 },
      );
    }

    const { data: updated, error: updateError } = await admin
      .from('shops')
      .update({
        name,
        slug,
        address,
        description: description || null,
        parking: parking || null,
        province_id: provinceId,
        city_id: cityId,
        street_id: streetId,
      })
      .eq('id', id)
      .select('id, approved')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, approved: updated.approved });
  } catch (error) {
    console.error('Update shop API error:', error);
    return NextResponse.json({ error: 'Unable to update this shop.' }, { status: 500 });
  }
}
