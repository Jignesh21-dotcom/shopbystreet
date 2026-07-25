import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RouteContext = {
  params: Promise<{
    requestNumber: string;
  }>;
};

function createServerClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured.');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for request tracking.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(
  req: Request,
  context: RouteContext,
) {
  try {
    const { requestNumber: rawRequestNumber } =
      await context.params;

    const requestNumber = decodeURIComponent(
      rawRequestNumber || '',
    ).trim();

    const url = new URL(req.url);
    const token = url.searchParams.get('token')?.trim() || '';

    if (!requestNumber) {
      return NextResponse.json(
        { error: 'Request number is required.' },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Customer access token is required.' },
        { status: 401 },
      );
    }

    const supabaseServer = createServerClient();

    const { data: requestData, error: requestError } =
      await supabaseServer
        .from('order_requests')
        .select(`
          id,
          request_number,
          customer_access_token,
          shop_id,
          product_id,
          customer_name,
          customer_email,
          customer_phone,
          quantity,
          fulfillment_method,
          delivery_address_line_1,
          delivery_address_line_2,
          delivery_city,
          delivery_province,
          delivery_postal_code,
          delivery_country,
          customer_note,
          shop_response_message,
          product_name_snapshot,
          product_price_snapshot,
          product_image_snapshot,
          shop_name_snapshot,
          status,
          requested_at,
          responded_at,
          accepted_at,
          declined_at,
          completed_at,
          cancelled_at,
          expires_at
        `)
        .eq('request_number', requestNumber)
        .maybeSingle();

    if (requestError) {
      console.error(
        'Tracking request query failed:',
        requestError,
      );

      return NextResponse.json(
        { error: requestError.message },
        { status: 500 },
      );
    }

    if (!requestData) {
      return NextResponse.json(
        { error: 'Order Request not found.' },
        { status: 404 },
      );
    }

    const storedToken = String(
      requestData.customer_access_token || '',
    ).trim();

    if (storedToken !== token) {
      return NextResponse.json(
        {
          error:
            'Order Request not found or the secure access link is invalid.',
        },
        { status: 404 },
      );
    }

    let effectiveStatus = requestData.status;

    if (
      effectiveStatus === 'pending' &&
      new Date(requestData.expires_at).getTime() <=
        Date.now()
    ) {
      effectiveStatus = 'expired';

      const { error: expiryError } =
        await supabaseServer
          .from('order_requests')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestData.id)
          .eq('status', 'pending');

      if (expiryError) {
        console.error(
          'Unable to persist expired request status:',
          expiryError,
        );
      }
    }

    let countrySlug: string | null = null;

    const { data: shopLocation } = await supabaseServer
      .from('shops')
      .select('street_id')
      .eq('id', requestData.shop_id)
      .maybeSingle();

    if (shopLocation?.street_id) {
      const { data: streetLocation } = await supabaseServer
        .from('streets')
        .select('country')
        .eq('id', shopLocation.street_id)
        .maybeSingle();

      countrySlug = streetLocation?.country || null;
    }

    const {
      customer_access_token: _customerAccessToken,
      ...safeRequest
    } = requestData;

    return NextResponse.json(
      {
        request: {
          ...safeRequest,
          status: effectiveStatus,
          country_slug: countrySlug,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    console.error(
      'Track Order Request API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load Order Request.',
      },
      { status: 500 },
    );
  }
}