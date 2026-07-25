import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const allowedLocationTypes = new Set([
  'building',
  'complex',
  'mall',
  'market',
  'bazaar',
  'plaza',
  'village_centre',
  'commercial_area',
  'independent',
  'other',
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration is incomplete.' }, { status: 500 });
    }

    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || '';
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const authenticatedClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await authenticatedClient.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: isAdmin, error: adminCheckError } = await authenticatedClient.rpc('is_admin');
    if (adminCheckError) {
      return NextResponse.json({ error: 'Unable to verify administrator access.' }, { status: 500 });
    }
    if (isAdmin !== true) {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const body = await request.json();
    const streetName = String(body.streetName || '').trim();
    const locationName = String(body.locationName || '').trim();
    const existingLocationId = String(body.existingLocationId || '').trim() || null;
    const requestedLocationType = String(body.locationType || 'complex').trim();
    const locationType = allowedLocationTypes.has(requestedLocationType)
      ? requestedLocationType
      : 'other';
    const adminNotes = String(body.adminNotes || '').trim() || null;

    if (!streetName) {
      return NextResponse.json({ error: 'Final street or road name is required.' }, { status: 400 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: submission, error: submissionError } = await adminClient
      .from('india_business_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 });
    }
    if (!submission) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });

    if (submission.status === 'approved') {
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
        shopId: submission.approved_shop_id,
        streetId: submission.approved_street_id,
        locationId: submission.approved_location_id,
      });
    }

    if (submission.status !== 'pending' && submission.status !== 'needs_information') {
      return NextResponse.json(
        { error: `Cannot approve a ${submission.status} submission.` },
        { status: 409 },
      );
    }

    const { data: country, error: countryError } = await adminClient
      .from('countries')
      .select('id,slug')
      .eq('slug', 'india')
      .maybeSingle();

    if (countryError || !country) {
      return NextResponse.json({ error: 'India country record was not found.' }, { status: 400 });
    }

    const stateSlug = slugify(submission.state_name || 'Gujarat');
    const { data: state, error: stateError } = await adminClient
      .from('provinces')
      .select('id,slug')
      .eq('country_id', country.id)
      .eq('slug', stateSlug)
      .maybeSingle();

    if (stateError || !state) {
      return NextResponse.json(
        { error: `State "${submission.state_name}" was not found in provinces.` },
        { status: 400 },
      );
    }

    const cityName = String(submission.city_name || '').trim();
    const citySlug = slugify(cityName);
    if (!citySlug) return NextResponse.json({ error: 'A valid city is required.' }, { status: 400 });

    let { data: city, error: cityLookupError } = await adminClient
      .from('cities')
      .select('id,name,slug')
      .eq('province_id', state.id)
      .eq('slug', citySlug)
      .maybeSingle();

    if (cityLookupError) return NextResponse.json({ error: cityLookupError.message }, { status: 500 });

    if (!city) {
      const createdCity = await adminClient
        .from('cities')
        .insert({ name: cityName, slug: citySlug, province_id: state.id, country_id: country.id })
        .select('id,name,slug')
        .single();

      if (createdCity.error || !createdCity.data) {
        return NextResponse.json(
          { error: `Unable to create city: ${createdCity.error?.message || 'Unknown error.'}` },
          { status: 500 },
        );
      }
      city = createdCity.data;
    }

    const streetBaseSlug = slugify(streetName);
    const streetSlug = `${citySlug}-${streetBaseSlug}`;

    let { data: street, error: streetLookupError } = await adminClient
      .from('streets')
      .select('id,name,slug')
      .eq('city_id', city.id)
      .eq('slug', streetSlug)
      .maybeSingle();

    if (streetLookupError) return NextResponse.json({ error: streetLookupError.message }, { status: 500 });

    if (!street) {
      const latitude = submission.latitude === null || submission.latitude === ''
        ? null
        : Number(submission.latitude);
      const longitude = submission.longitude === null || submission.longitude === ''
        ? null
        : Number(submission.longitude);

      const createdStreet = await adminClient
        .from('streets')
        .insert({
          name: streetName,
          display_name: streetName,
          slug: streetSlug,
          city_id: city.id,
          country: 'india',
          province: stateSlug,
          city: citySlug,
          lat: Number.isFinite(latitude) ? latitude : null,
          lon: Number.isFinite(longitude) ? longitude : null,
        })
        .select('id,name,slug')
        .single();

      if (createdStreet.error || !createdStreet.data) {
        return NextResponse.json(
          { error: `Unable to create street: ${createdStreet.error?.message || 'Unknown error.'}` },
          { status: 500 },
        );
      }
      street = createdStreet.data;
    }

    let location: { id: string; name: string; slug: string; location_type: string } | null = null;

    if (existingLocationId) {
      const existing = await adminClient
        .from('street_locations')
        .select('id,name,slug,location_type')
        .eq('id', existingLocationId)
        .eq('street_id', street.id)
        .maybeSingle();

      if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
      if (!existing.data) {
        return NextResponse.json({ error: 'The selected existing location was not found on this street.' }, { status: 400 });
      }
      location = existing.data;
    } else if (locationName && locationType !== 'independent') {
      const locationSlug = slugify(locationName);

      const lookup = await adminClient
        .from('street_locations')
        .select('id,name,slug,location_type')
        .eq('street_id', street.id)
        .eq('slug', locationSlug)
        .maybeSingle();

      if (lookup.error) return NextResponse.json({ error: lookup.error.message }, { status: 500 });
      location = lookup.data;

      if (!location) {
        const latitude = submission.latitude === null || submission.latitude === ''
          ? null
          : Number(submission.latitude);
        const longitude = submission.longitude === null || submission.longitude === ''
          ? null
          : Number(submission.longitude);

        const createdLocation = await adminClient
          .from('street_locations')
          .insert({
            name: locationName,
            slug: locationSlug,
            location_type: locationType,
            street_id: street.id,
            city_id: city.id,
            province_id: state.id,
            country_id: country.id,
            full_address: submission.full_address || null,
            landmark: submission.landmark || null,
            latitude: Number.isFinite(latitude) ? latitude : null,
            longitude: Number.isFinite(longitude) ? longitude : null,
          })
          .select('id,name,slug,location_type')
          .single();

        if (createdLocation.error || !createdLocation.data) {
          return NextResponse.json(
            { error: `Unable to create complex/location: ${createdLocation.error?.message || 'Unknown error.'}` },
            { status: 500 },
          );
        }
        location = createdLocation.data;
      }
    }

    const baseShopSlug = [slugify(submission.business_name), streetBaseSlug, citySlug]
      .filter(Boolean)
      .join('-');
    let finalShopSlug = baseShopSlug;

    const used = await adminClient
      .from('shops')
      .select('id')
      .eq('street_id', street.id)
      .eq('slug', finalShopSlug)
      .maybeSingle();

    if (used.error) return NextResponse.json({ error: used.error.message }, { status: 500 });
    if (used.data) finalShopSlug = `${baseShopSlug}-${id.slice(0, 8)}`;

    const existingShopQuery = await adminClient
      .from('shops')
      .select('id,name,slug,phone,address')
      .eq('street_id', street.id)
      .ilike('name', submission.business_name)
      .limit(1)
      .maybeSingle();

    if (existingShopQuery.error) {
      return NextResponse.json({ error: existingShopQuery.error.message }, { status: 500 });
    }

    if (existingShopQuery.data) {
      return NextResponse.json(
        {
          error: `A shop named "${existingShopQuery.data.name}" already exists on this street. Review the existing record before approving another one.`,
          existingShop: existingShopQuery.data,
        },
        { status: 409 },
      );
    }

    const inserted = await adminClient
      .from('shops')
      .insert({
        name: submission.business_name,
        slug: finalShopSlug,
        address: submission.full_address,
        description: submission.description,
        parking: submission.parking,
        category: submission.category,
        street_id: street.id,
        location_id: location?.id || null,
        city_id: city.id,
        province_id: state.id,
        owner_id: submission.submitted_by,
        approved: true,
        phone: submission.phone || submission.whatsapp || null,
        website: submission.website || null,
      })
      .select('id,name,slug')
      .single();

    if (inserted.error || !inserted.data) {
      return NextResponse.json(
        { error: `Unable to create shop: ${inserted.error?.message || 'Unknown error.'}` },
        { status: 500 },
      );
    }

    const { error: updateError } = await adminClient
      .from('india_business_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.user.id,
        approved_shop_id: inserted.data.id,
        approved_street_id: street.id,
        approved_location_id: location?.id || null,
        admin_notes: adminNotes,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: `Shop was created, but submission update failed: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      shopId: inserted.data.id,
      shopSlug: inserted.data.slug,
      streetId: street.id,
      streetSlug: street.slug,
      locationId: location?.id || null,
      locationName: location?.name || null,
    });
  } catch (error) {
    console.error('India hybrid approval failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to approve this submission.' },
      { status: 500 },
    );
  }
}
