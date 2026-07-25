import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findMatchingStreet } from '@/lib/indiaLocationMatching';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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
    if (adminCheckError || isAdmin !== true) {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const body = await request.json();
    const streetName = String(body.streetName || '').trim();
    const locationName = String(body.locationName || '').trim();

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

    const { data: country } = await adminClient
      .from('countries')
      .select('id, name, slug')
      .eq('slug', 'india')
      .maybeSingle();

    const stateSlug = slugify(submission.state_name || 'Gujarat');
    const { data: state } = country
      ? await adminClient
          .from('provinces')
          .select('id, name, slug')
          .eq('country_id', country.id)
          .eq('slug', stateSlug)
          .maybeSingle()
      : { data: null };

    const citySlug = slugify(submission.city_name || '');
    const { data: city } = state && citySlug
      ? await adminClient
          .from('cities')
          .select('id, name, slug')
          .eq('province_id', state.id)
          .eq('slug', citySlug)
          .maybeSingle()
      : { data: null };

    const streetSlug = streetName && citySlug ? `${citySlug}-${slugify(streetName)}` : '';
    let street = null;

    if (city && streetName) {
      const existingStreets = await adminClient
        .from('streets')
        .select('id, name, slug')
        .eq('city_id', city.id);

      if (existingStreets.error) {
        return NextResponse.json(
          { error: existingStreets.error.message },
          { status: 500 },
        );
      }

      street = findMatchingStreet(existingStreets.data || [], streetName);
    }

    const { data: locations } = street
      ? await adminClient
          .from('street_locations')
          .select('id, name, slug, location_type, full_address, landmark')
          .eq('street_id', street.id)
          .order('name')
      : { data: [] };

    const locationSlug = slugify(locationName);
    const exactLocation = (locations || []).find((location) => location.slug === locationSlug) || null;

    let possibleDuplicateShops: Array<Record<string, unknown>> = [];
    if (city) {
      let query = adminClient
        .from('shops')
        .select('id, name, slug, phone, address, street_id, location_id, approved')
        .eq('city_id', city.id)
        .ilike('name', submission.business_name || '');

      if (street) query = query.eq('street_id', street.id);
      const duplicateResult = await query.limit(10);
      possibleDuplicateShops = duplicateResult.data || [];

      if (submission.phone) {
        const phoneResult = await adminClient
          .from('shops')
          .select('id, name, slug, phone, address, street_id, location_id, approved')
          .eq('city_id', city.id)
          .eq('phone', submission.phone)
          .limit(10);

        for (const shop of phoneResult.data || []) {
          if (!possibleDuplicateShops.some((existing) => existing.id === shop.id)) {
            possibleDuplicateShops.push(shop);
          }
        }
      }
    }

    return NextResponse.json({
      country: country ? { status: 'matched', record: country } : { status: 'missing', record: null },
      state: state ? { status: 'matched', record: state } : { status: 'missing', record: null },
      city: city
        ? { status: 'matched', record: city }
        : { status: citySlug ? 'will_create' : 'missing', record: null, proposedSlug: citySlug },
      street: street
        ? { status: 'matched', record: street }
        : { status: streetSlug ? 'will_create' : 'missing', record: null, proposedSlug: streetSlug },
      location: locationName
        ? exactLocation
          ? { status: 'matched', record: exactLocation }
          : { status: 'will_create', record: null, proposedSlug: locationSlug }
        : { status: 'independent', record: null },
      existingLocations: locations || [],
      possibleDuplicateShops,
    });
  } catch (error) {
    console.error('India approval matching failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to calculate approval matches.' },
      { status: 500 },
    );
  }
}
