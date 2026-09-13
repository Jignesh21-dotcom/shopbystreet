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
  cityName?: unknown;
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
    let cityId = getString(body.cityId);
    let streetId = getString(body.streetId);
    const cityName = getString(body.cityName);
    const streetName = getString(body.streetName);

    if (!id || !name || !slug || !address || !provinceId) {
      return NextResponse.json(
        { error: 'Name, URL slug, full address, and province/state are required.' },
        { status: 400 },
      );
    }

    if (name.length > 200 || slug.length > 220 || address.length > 500) {
      return NextResponse.json(
        { error: 'One or more submitted fields are too long.' },
        { status: 400 },
      );
    }

    const [provinceResult, slugResult] = await Promise.all([
      admin
        .from('provinces')
        .select('id, name, slug, country_id')
        .eq('id', provinceId)
        .maybeSingle(),
      admin
        .from('shops')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .limit(1)
        .maybeSingle(),
    ]);

    const lookupError = provinceResult.error || slugResult.error;
    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (!provinceResult.data) {
      return NextResponse.json(
        { error: 'The selected province/state was not found.' },
        { status: 400 },
      );
    }

    if (slugResult.data) {
      return NextResponse.json(
        { error: 'That shop URL is already in use. Please choose another slug.' },
        { status: 409 },
      );
    }

    const province = provinceResult.data;
    const { data: country, error: countryError } = await admin
      .from('countries')
      .select('id, slug')
      .eq('id', province.country_id)
      .maybeSingle();

    if (countryError) {
      return NextResponse.json({ error: countryError.message }, { status: 500 });
    }
    if (!country) {
      return NextResponse.json(
        { error: 'The country for the selected province/state could not be found.' },
        { status: 400 },
      );
    }

    const isIndia = country.slug === 'india';
    let createdCity = false;
    let createdStreet = false;

    if (isIndia) {
      if (!cityName || !streetName) {
        return NextResponse.json(
          { error: 'For India, city / municipality and public listing street / market are required.' },
          { status: 400 },
        );
      }

      const citySlug = slugify(cityName);
      const streetBaseSlug = slugify(streetName);
      if (!citySlug || !streetBaseSlug) {
        return NextResponse.json(
          { error: 'Please enter a valid city and street / market name.' },
          { status: 400 },
        );
      }

      let { data: city, error: cityLookupError } = await admin
        .from('cities')
        .select('id, name, slug')
        .eq('province_id', province.id)
        .eq('slug', citySlug)
        .maybeSingle();

      if (cityLookupError) {
        return NextResponse.json({ error: cityLookupError.message }, { status: 500 });
      }

      if (!city) {
        const created = await admin
          .from('cities')
          .insert({
            name: cityName,
            slug: citySlug,
            province_id: province.id,
            country_id: country.id,
          })
          .select('id, name, slug')
          .single();

        if (created.error || !created.data) {
          return NextResponse.json(
            { error: `Unable to create city: ${created.error?.message || 'Unknown error.'}` },
            { status: 500 },
          );
        }
        city = created.data;
        createdCity = true;
      }

      cityId = city.id;

      // India streets created by the India approval flow use a city-prefixed slug.
      // First try to reuse by name, then by the standard slug, before creating one.
      let { data: street, error: streetLookupError } = await admin
        .from('streets')
        .select('id, name, slug')
        .eq('city_id', city.id)
        .ilike('name', streetName)
        .limit(1)
        .maybeSingle();

      if (streetLookupError) {
        return NextResponse.json({ error: streetLookupError.message }, { status: 500 });
      }

      const standardStreetSlug = `${citySlug}-${streetBaseSlug}`;
      if (!street) {
        const slugLookup = await admin
          .from('streets')
          .select('id, name, slug')
          .eq('city_id', city.id)
          .eq('slug', standardStreetSlug)
          .maybeSingle();

        if (slugLookup.error) {
          return NextResponse.json({ error: slugLookup.error.message }, { status: 500 });
        }
        street = slugLookup.data;
      }

      if (!street) {
        const created = await admin
          .from('streets')
          .insert({
            name: streetName,
            display_name: streetName,
            slug: standardStreetSlug,
            city_id: city.id,
            country: 'india',
            province: province.slug,
            city: citySlug,
          })
          .select('id, name, slug')
          .single();

        if (created.error || !created.data) {
          return NextResponse.json(
            { error: `Unable to create street / market: ${created.error?.message || 'Unknown error.'}` },
            { status: 500 },
          );
        }
        street = created.data;
        createdStreet = true;
      }

      streetId = street.id;
    } else {
      if (!cityId || !streetId) {
        return NextResponse.json(
          { error: 'Province, city, and street are required.' },
          { status: 400 },
        );
      }

      const [cityResult, streetResult] = await Promise.all([
        admin.from('cities').select('id, province_id').eq('id', cityId).maybeSingle(),
        admin.from('streets').select('id, city_id').eq('id', streetId).maybeSingle(),
      ]);

      const relationError = cityResult.error || streetResult.error;
      if (relationError) {
        return NextResponse.json({ error: relationError.message }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      approved: updated.approved,
      cityId,
      streetId,
      createdCity,
      createdStreet,
    });
  } catch (error) {
    console.error('Update shop API error:', error);
    return NextResponse.json({ error: 'Unable to update this shop.' }, { status: 500 });
  }
}
