import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration is incomplete.' }, { status: 500 });
    }

    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || '';
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [shopsResult, submissionsResult] = await Promise.all([
      admin
        .from('shops')
        .select(`
          id,
          name,
          slug,
          address,
          approved,
          street:street_id (
            id,
            name,
            slug,
            city:city_id (
              id,
              name,
              slug
            )
          ),
          province:province_id (
            id,
            name,
            slug,
            country:country_id (
              id,
              name,
              slug
            )
          ),
          location:location_id (
            id,
            name,
            slug,
            location_type
          )
        `)
        .eq('owner_id', authData.user.id)
        .eq('approved', true)
        .order('name', { ascending: true }),
      admin
        .from('india_business_submissions')
        .select('id,business_name,category,city_name,state_name,street_or_market,building_name,full_address,status,created_at,approved_shop_id,admin_notes')
        .eq('submitted_by', authData.user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (shopsResult.error) {
      return NextResponse.json({ error: shopsResult.error.message }, { status: 500 });
    }
    if (submissionsResult.error) {
      return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      shops: shopsResult.data || [],
      indiaSubmissions: submissionsResult.data || [],
    });
  } catch (error) {
    console.error('Global shop owner dashboard failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load the dashboard.' },
      { status: 500 },
    );
  }
}
