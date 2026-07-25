import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const text = (v: unknown, max = 500) => typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function POST(req: Request) {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anon || !service) return NextResponse.json({ error: 'Server configuration is incomplete.' }, { status: 500 });

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: auth } = await authClient.auth.getUser(token);
    if (!auth.user) return NextResponse.json({ error: 'Please sign in before submitting.' }, { status: 401 });

    const body = await req.json();
    const businessName = text(body.businessName, 200);
    const streetOrMarket = text(body.streetOrMarket, 250);
    const cityName = text(body.cityName, 150);
    const stateName = text(body.stateName, 100) || 'Gujarat';
    const fullAddress = text(body.fullAddress, 2000);
    const email = text(body.email, 250);
    const phone = text(body.phone, 50);
    const whatsapp = text(body.whatsapp, 50);

    if (!businessName || !streetOrMarket || !cityName || !fullAddress) return NextResponse.json({ error: 'Required business and address fields are missing.' }, { status: 400 });
    if (!email && !phone && !whatsapp) return NextResponse.json({ error: 'Provide at least one contact method.' }, { status: 400 });

    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: duplicate } = await admin.from('india_business_submissions').select('id,status').eq('submitted_by', auth.user.id).ilike('business_name', businessName).ilike('full_address', fullAddress).in('status', ['pending','approved']).limit(1).maybeSingle();
    if (duplicate) return NextResponse.json({ success: true, alreadyExists: true, submission: duplicate });

    const latitude = Number(text(body.latitude, 30));
    const longitude = Number(text(body.longitude, 30));
    const { data, error } = await admin.from('india_business_submissions').insert({
      submitted_by: auth.user.id, business_name: businessName, category: text(body.category, 150) || null,
      description: text(body.description, 3000) || null, owner_name: text(body.ownerName, 200) || null,
      email: email || auth.user.email || null, phone: phone || null, whatsapp: whatsapp || null,
      website: text(body.website, 500) || null, instagram: text(body.instagram, 250) || null,
      shop_number: text(body.shopNumber, 100) || null, floor: text(body.floor, 100) || null,
      building_name: text(body.buildingName, 250) || null, landmark: text(body.landmark, 500) || null,
      street_or_market: streetOrMarket, locality: text(body.locality, 250) || null,
      village_town: text(body.villageTown, 250) || null, city_name: cityName,
      district: text(body.district, 200) || null, state_name: stateName,
      pin_code: text(body.pinCode, 20) || null, full_address: fullAddress,
      google_maps_url: text(body.googleMapsUrl, 1000) || null,
      latitude: Number.isFinite(latitude) ? latitude : null, longitude: Number.isFinite(longitude) ? longitude : null,
      parking: text(body.parking, 500) || null, status: 'pending',
    }).select('id,status,created_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, submission: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to submit the business.' }, { status: 500 });
  }
}
