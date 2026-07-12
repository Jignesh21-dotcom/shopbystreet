import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { sendCustomerOrderRequestStatusEmail } from '@/lib/marketplaceEmail';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RequestAction = 'accept' | 'decline';

type ActionPayload = {
  action?: RequestAction;
  shopPrivateNote?: string | null;
  shopResponseMessage?: string | null;
};

type OrderRequestRow = {
  id: string;
  shop_id: string;
  request_number: string;
  customer_access_token: string;
  customer_name: string;
  customer_email: string;
  quantity: number;
  fulfillment_method: 'pickup' | 'local_delivery' | 'shipping';
  product_name_snapshot: string;
  product_price_snapshot: number | string;
  shop_name_snapshot: string;
  status: string;
  expires_at: string;
  service_fee_amount: number | string;
};

const INTRODUCTORY_FREE_ACCEPTED_LIMIT = 5;
const ACCEPTED_LIFECYCLE_STATUSES = [
  'accepted',
  'contacted',
  'completed',
];

const FULFILLMENT_LABELS = {
  pickup: 'Pickup',
  local_delivery: 'Local Delivery',
  shipping: 'Shipping',
};

function getSupabaseClients() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured.');
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Supabase anonymous key is not configured.',
    );
  }

  const supabaseServer = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : supabase;

  const authClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return {
    supabaseServer,
    authClient,
  };
}

async function authenticateRequest(req: Request) {
  const { supabaseServer, authClient } =
    getSupabaseClients();

  const authHeader = req.headers.get('authorization');

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 },
      ),
    };
  }

  const { data: authData, error: authError } =
    await authClient.auth.getUser(token);

  if (authError || !authData?.user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 },
      ),
    };
  }

  return {
    supabaseServer,
    user: authData.user,
  };
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export async function PATCH(
  req: Request,
  context: RouteContext,
) {
  try {
    const { id: rawRequestId } = await context.params;
    const requestId = rawRequestId?.trim();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Order Request ID is required.' },
        { status: 400 },
      );
    }

    const auth = await authenticateRequest(req);

    if ('errorResponse' in auth) {
      return auth.errorResponse;
    }

    const body = (await req.json()) as ActionPayload;
    const action = body.action;
    const shopPrivateNote = normalizeOptionalText(
      body.shopPrivateNote,
    );

    const shopResponseMessage = normalizeOptionalText(
      body.shopResponseMessage,
    );

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Action must be accept or decline.' },
        { status: 400 },
      );
    }

    if (
      shopPrivateNote !== null &&
      shopPrivateNote.length > 2000
    ) {
      return NextResponse.json(
        { error: 'Private note is too long.' },
        { status: 400 },
      );
    }

    if (
      shopResponseMessage !== null &&
      shopResponseMessage.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            'The customer response message must be 2,000 characters or fewer.',
        },
        { status: 400 },
      );
    }

    const { data: requestData, error: requestError } =
      await auth.supabaseServer
        .from('order_requests')
        .select(`
          id,
          shop_id,
          request_number,
          customer_access_token,
          customer_name,
          customer_email,
          quantity,
          fulfillment_method,
          product_name_snapshot,
          product_price_snapshot,
          shop_name_snapshot,
          status,
          expires_at,
          service_fee_amount
        `)
        .eq('id', requestId)
        .maybeSingle();

    if (requestError) {
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

    const orderRequest =
      requestData as OrderRequestRow;

    const { data: shopData, error: shopError } =
      await auth.supabaseServer
        .from('shops')
        .select('id, owner_id, approved, name')
        .eq('id', orderRequest.shop_id)
        .maybeSingle();

    if (shopError) {
      return NextResponse.json(
        { error: shopError.message },
        { status: 500 },
      );
    }

    if (
      !shopData ||
      shopData.owner_id !== auth.user.id ||
      !shopData.approved
    ) {
      return NextResponse.json(
        {
          error:
            'You are not allowed to manage this Order Request.',
        },
        { status: 403 },
      );
    }

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL;

    const siteUrl = configuredSiteUrl
      ? configuredSiteUrl.startsWith('http')
        ? configuredSiteUrl
        : `https://${configuredSiteUrl}`
      : new URL(req.url).origin;

    const trackingUrl =
      `${siteUrl}/order-request/${encodeURIComponent(
        orderRequest.request_number,
      )}?token=${encodeURIComponent(
        orderRequest.customer_access_token,
      )}`;

    const estimatedTotal =
      Number(orderRequest.product_price_snapshot) *
      orderRequest.quantity;

    if (orderRequest.status !== 'pending') {
      return NextResponse.json(
        {
          error:
            'Only pending Order Requests can be accepted or declined.',
          code: 'REQUEST_NOT_PENDING',
          status: orderRequest.status,
        },
        { status: 409 },
      );
    }

    const now = new Date();

    if (
      new Date(orderRequest.expires_at).getTime() <=
      now.getTime()
    ) {
      await auth.supabaseServer
        .from('order_requests')
        .update({
          status: 'expired',
          updated_at: now.toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');

      return NextResponse.json(
        {
          error:
            'This Order Request has expired and can no longer be changed.',
          code: 'REQUEST_EXPIRED',
        },
        { status: 409 },
      );
    }

    if (action === 'decline') {
      const { data: declinedRequest, error: declineError } =
        await auth.supabaseServer
          .from('order_requests')
          .update({
            status: 'declined',
            declined_at: now.toISOString(),
            responded_at: now.toISOString(),
            shop_private_note: shopPrivateNote,
            shop_response_message: shopResponseMessage,
            service_fee_applies: false,
            introductory_fee_waived: false,
            updated_at: now.toISOString(),
          })
          .eq('id', requestId)
          .eq('status', 'pending')
          .select(`
            id,
            request_number,
            status,
            declined_at,
            responded_at,
            shop_private_note,
            shop_response_message
          `)
          .maybeSingle();

      if (declineError) {
        return NextResponse.json(
          { error: declineError.message },
          { status: 500 },
        );
      }

      if (!declinedRequest) {
        return NextResponse.json(
          {
            error:
              'This request was already changed by another action.',
            code: 'REQUEST_ALREADY_CHANGED',
          },
          { status: 409 },
        );
      }

      try {
        await sendCustomerOrderRequestStatusEmail({
          customerName: orderRequest.customer_name,
          customerEmail: orderRequest.customer_email,
          requestNumber: orderRequest.request_number,
          shopName: orderRequest.shop_name_snapshot,
          productName: orderRequest.product_name_snapshot,
          quantity: orderRequest.quantity,
          estimatedTotal,
          fulfillmentLabel:
            FULFILLMENT_LABELS[
              orderRequest.fulfillment_method
            ],
          status: 'declined',
          shopResponseMessage,
          trackingUrl,
        });
      } catch (emailError) {
        console.error(
          'Declined Order Request customer email failed:',
          emailError,
        );
      }

      return NextResponse.json({
        success: true,
        action: 'decline',
        request: declinedRequest,
      });
    }

    const { count, error: countError } =
      await auth.supabaseServer
        .from('order_requests')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('shop_id', orderRequest.shop_id)
        .in('status', ACCEPTED_LIFECYCLE_STATUSES);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 },
      );
    }

    const previouslyAcceptedCount = count ?? 0;
    const introductoryRequestNumber =
      previouslyAcceptedCount + 1;

    const isIntroductoryFeeWaived =
      previouslyAcceptedCount <
      INTRODUCTORY_FREE_ACCEPTED_LIMIT;

    const ledgerAmount = isIntroductoryFeeWaived
      ? 0
      : Number(orderRequest.service_fee_amount);

    if (
      !Number.isFinite(ledgerAmount) ||
      ledgerAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            'The configured service fee amount is invalid.',
        },
        { status: 500 },
      );
    }

    const ledgerStatus = isIntroductoryFeeWaived
      ? 'waived'
      : 'pending';

    const ledgerDescription = isIntroductoryFeeWaived
      ? `Introductory free accepted Order Request ${introductoryRequestNumber} of ${INTRODUCTORY_FREE_ACCEPTED_LIMIT}`
      : `Accepted Order Request service fee for ${orderRequest.request_number}`;

    const { data: acceptedRequest, error: acceptError } =
      await auth.supabaseServer
        .from('order_requests')
        .update({
          status: 'accepted',
          accepted_at: now.toISOString(),
          responded_at: now.toISOString(),
          shop_private_note: shopPrivateNote,
          shop_response_message: shopResponseMessage,
          service_fee_applies:
            !isIntroductoryFeeWaived,
          introductory_fee_waived:
            isIntroductoryFeeWaived,
          updated_at: now.toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending')
        .select(`
          id,
          shop_id,
          request_number,
          status,
          accepted_at,
          responded_at,
          service_fee_amount,
          service_fee_applies,
          introductory_fee_waived,
          shop_private_note,
          shop_response_message
        `)
        .maybeSingle();

    if (acceptError) {
      return NextResponse.json(
        { error: acceptError.message },
        { status: 500 },
      );
    }

    if (!acceptedRequest) {
      return NextResponse.json(
        {
          error:
            'This request was already changed by another action.',
          code: 'REQUEST_ALREADY_CHANGED',
        },
        { status: 409 },
      );
    }

    const { data: ledgerEntry, error: ledgerError } =
      await auth.supabaseServer
        .from('service_fee_ledger')
        .insert({
          shop_id: orderRequest.shop_id,
          order_request_id: requestId,
          amount: ledgerAmount,
          status: ledgerStatus,
          description: ledgerDescription,
          waived_at: isIntroductoryFeeWaived
            ? now.toISOString()
            : null,
          updated_at: now.toISOString(),
        })
        .select(`
          id,
          shop_id,
          order_request_id,
          amount,
          status,
          description,
          waived_at,
          created_at
        `)
        .single();

    if (ledgerError) {
      const { error: rollbackError } =
        await auth.supabaseServer
          .from('order_requests')
          .update({
            status: 'pending',
            accepted_at: null,
            responded_at: null,
            shop_response_message: null,
            service_fee_applies: false,
            introductory_fee_waived: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestId)
          .eq('status', 'accepted');

      console.error(
        'Failed to create service fee ledger entry:',
        ledgerError,
      );

      if (rollbackError) {
        console.error(
          'Failed to roll back accepted Order Request:',
          rollbackError,
        );
      }

      return NextResponse.json(
        {
          error:
            'The request could not be accepted because the service-fee record could not be created.',
        },
        { status: 500 },
      );
    }

    try {
      await sendCustomerOrderRequestStatusEmail({
        customerName: orderRequest.customer_name,
        customerEmail: orderRequest.customer_email,
        requestNumber: orderRequest.request_number,
        shopName: orderRequest.shop_name_snapshot,
        productName: orderRequest.product_name_snapshot,
        quantity: orderRequest.quantity,
        estimatedTotal,
        fulfillmentLabel:
          FULFILLMENT_LABELS[
            orderRequest.fulfillment_method
          ],
        status: 'accepted',
        shopResponseMessage,
        trackingUrl,
      });
    } catch (emailError) {
      console.error(
        'Accepted Order Request customer email failed:',
        emailError,
      );
    }

    return NextResponse.json({
      success: true,
      action: 'accept',
      request: acceptedRequest,
      ledger: ledgerEntry,
      serviceFee: {
        applies: !isIntroductoryFeeWaived,
        amount: ledgerAmount,
        status: ledgerStatus,
        introductoryFeeWaived:
          isIntroductoryFeeWaived,
        acceptedRequestNumber:
          introductoryRequestNumber,
        freeAcceptedLimit:
          INTRODUCTORY_FREE_ACCEPTED_LIMIT,
        remainingFreeAcceptedRequests:
          Math.max(
            INTRODUCTORY_FREE_ACCEPTED_LIMIT -
              introductoryRequestNumber,
            0,
          ),
      },
    });
  } catch (error) {
    console.error(
      'Manage Order Request API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update Order Request.',
      },
      { status: 500 },
    );
  }
}