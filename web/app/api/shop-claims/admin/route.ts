import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const allowedStatuses = ['pending', 'approved', 'rejected'] as const;
type ClaimStatus = (typeof allowedStatuses)[number];

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server configuration is incomplete.' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: isAdmin, error: adminError } = await authClient.rpc('is_admin');
    if (adminError || !isAdmin) {
      return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const rawStatus = url.searchParams.get('status') || 'pending';
    const status = allowedStatuses.includes(rawStatus as ClaimStatus)
      ? (rawStatus as ClaimStatus)
      : 'pending';

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabaseAdmin
      .from('shop_claims')
      .select(`
        id,
        message,
        status,
        created_at,
        reviewed_at,
        user_id,
        shop:shop_id (
          id,
          name,
          slug,
          address,
          owner_id,
          street:street_id (
            name,
            slug,
            city:city_id (
              name,
              slug
            )
          )
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin claims fetch failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const claims = (data || []).map((claim: any) => {
      let shop = claim.shop;
      if (Array.isArray(shop)) shop = shop[0] || null;
      if (shop?.street && Array.isArray(shop.street)) shop.street = shop.street[0] || null;
      if (shop?.street?.city && Array.isArray(shop.street.city)) {
        shop.street.city = shop.street.city[0] || null;
      }
      return { ...claim, shop };
    });

    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error('Admin claims API error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to load claims.' }, { status: 500 });
  }
}
