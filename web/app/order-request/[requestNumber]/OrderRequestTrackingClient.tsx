'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'contacted'
  | 'completed'
  | 'cancelled'
  | 'expired';

type OrderRequest = {
  id: string;
  request_number: string;
  shop_id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  quantity: number;
  fulfillment_method:
    | 'pickup'
    | 'local_delivery'
    | 'shipping';
  delivery_address_line_1: string | null;
  delivery_address_line_2: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_postal_code: string | null;
  delivery_country: string | null;
  customer_note: string | null;
  shop_response_message: string | null;
  product_name_snapshot: string;
  product_price_snapshot: number | string;
  product_image_snapshot: string | null;
  shop_name_snapshot: string;
  status: OrderStatus;
  requested_at: string;
  responded_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
};

type Props = {
  requestNumber: string;
};

const STATUS_CONTENT: Record<
  OrderStatus,
  {
    label: string;
    heading: string;
    message: string;
    badgeClass: string;
    panelClass: string;
    icon: string;
  }
> = {
  pending: {
    label: 'Pending',
    heading: 'Your request is waiting for review',
    message:
      'The shop has received your Order Request and will review it before the expiry time.',
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-800',
    panelClass:
      'border-amber-200 bg-amber-50 text-amber-900',
    icon: '⏳',
  },
  accepted: {
    label: 'Accepted',
    heading: 'Your request was accepted',
    message:
      'The shop has accepted your request and should contact you directly to arrange payment and fulfillment.',
    badgeClass:
      'border-green-200 bg-green-50 text-green-800',
    panelClass:
      'border-green-200 bg-green-50 text-green-900',
    icon: '✅',
  },
  contacted: {
    label: 'Contacted',
    heading: 'The shop has contacted you',
    message:
      'Please continue directly with the shop to confirm payment and fulfillment details.',
    badgeClass:
      'border-blue-200 bg-blue-50 text-blue-800',
    panelClass:
      'border-blue-200 bg-blue-50 text-blue-900',
    icon: '📞',
  },
  completed: {
    label: 'Completed',
    heading: 'This request is complete',
    message:
      'The shop marked this Order Request as completed.',
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-800',
    panelClass:
      'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: '🎉',
  },
  declined: {
    label: 'Declined',
    heading: 'The shop declined this request',
    message:
      'The shop was unable to fulfill this request. No payment was collected by LocalStreetShop.',
    badgeClass:
      'border-red-200 bg-red-50 text-red-800',
    panelClass:
      'border-red-200 bg-red-50 text-red-900',
    icon: '❌',
  },
  cancelled: {
    label: 'Cancelled',
    heading: 'This request was cancelled',
    message:
      'This Order Request is no longer active.',
    badgeClass:
      'border-slate-200 bg-slate-100 text-slate-700',
    panelClass:
      'border-slate-200 bg-slate-100 text-slate-800',
    icon: '🚫',
  },
  expired: {
    label: 'Expired',
    heading: 'This request expired',
    message:
      'The shop did not respond before the expiry time. No payment was collected.',
    badgeClass:
      'border-slate-200 bg-slate-100 text-slate-700',
    panelClass:
      'border-slate-200 bg-slate-100 text-slate-800',
    icon: '⌛',
  },
};

const FULFILLMENT_LABELS = {
  pickup: 'Pickup',
  local_delivery: 'Local Delivery',
  shipping: 'Shipping',
};

function formatDateTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function OrderRequestTrackingClient({
  requestNumber,
}: Props) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [request, setRequest] =
    useState<OrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRequest = async () => {
      setLoading(true);
      setErrorMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setIsLoggedIn(Boolean(user));

      if (!token) {
        setErrorMessage(
          'This secure request link is missing its access token.',
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/order-requests/${encodeURIComponent(
          requestNumber,
        )}?token=${encodeURIComponent(token)}`,
        { cache: 'no-store' },
      );

      const responseText = await response.text();
      let result: any = null;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        if (!isMounted) return;

        setErrorMessage(
          'The server returned an unexpected response.',
        );
        setLoading(false);
        return;
      }

      if (!isMounted) return;

      if (!response.ok) {
        setErrorMessage(
          result?.error ||
            'Unable to load this Order Request.',
        );
        setLoading(false);
        return;
      }

      setRequest(result.request as OrderRequest);
      setLoading(false);
    };

    loadRequest();

    return () => {
      isMounted = false;
    };
  }, [requestNumber, token]);

  const estimatedTotal = useMemo(() => {
    if (!request) return 0;

    return (
      Number(request.product_price_snapshot) *
      request.quantity
    );
  }, [request]);

  const backHref = isLoggedIn
    ? '/my-order-requests'
    : '/';

  const backLabel = isLoggedIn
    ? 'Back to My Order Requests'
    : 'Back to LocalStreetShop';

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-600">
            Loading your Order Request...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !request) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl" aria-hidden="true">
            🔒
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-slate-950">
            Unable to open Order Request
          </h1>

          <p className="mt-3 text-slate-600">
            {errorMessage}
          </p>

          <Link
            href={backHref}
            className="mt-6 inline-flex rounded-full bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            {backLabel}
          </Link>
        </div>
      </main>
    );
  }

  const statusContent =
    STATUS_CONTENT[request.status];

  const address = [
    request.delivery_address_line_1,
    request.delivery_address_line_2,
    request.delivery_city,
    request.delivery_province,
    request.delivery_postal_code,
    request.delivery_country,
  ].filter(Boolean);

  const statusDate =
    request.status === 'accepted'
      ? request.accepted_at
      : request.status === 'declined'
        ? request.declined_at
        : request.status === 'completed'
          ? request.completed_at
          : request.status === 'cancelled'
            ? request.cancelled_at
            : request.responded_at;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← {backLabel}
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Marketplace Phase 1
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-5xl">
                Track Order Request
              </h1>

              <p className="mt-3 text-blue-50">
                Request {request.request_number}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-bold ${statusContent.badgeClass}`}
            >
              {statusContent.label}
            </span>
          </div>
        </section>

        <section
          className={`mt-6 rounded-3xl border p-6 shadow-sm sm:p-8 ${statusContent.panelClass}`}
        >
          <div className="text-4xl" aria-hidden="true">
            {statusContent.icon}
          </div>

          <h2 className="mt-3 text-2xl font-extrabold">
            {statusContent.heading}
          </h2>

          <p className="mt-2 max-w-3xl leading-7">
            {statusContent.message}
          </p>

          {statusDate && (
            <p className="mt-4 text-sm font-semibold">
              Updated {formatDateTime(statusDate)}
            </p>
          )}
        </section>

        {request.shop_response_message && (
          <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
              Message from {request.shop_name_snapshot}
            </p>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5">
              <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">
                {request.shop_response_message}
              </p>
            </div>
          </section>
        )}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-[260px_1fr]">
            {request.product_image_snapshot ? (
              <img
                src={request.product_image_snapshot}
                alt={request.product_name_snapshot}
                className="h-64 w-full object-cover md:h-full"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center bg-blue-50 text-sm font-bold text-blue-700">
                No product image
              </div>
            )}

            <div className="p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                {request.shop_name_snapshot}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                {request.product_name_snapshot}
              </h2>

              <dl className="mt-6 space-y-3 text-sm">
                <DetailRow
                  label="Quantity"
                  value={String(request.quantity)}
                />
                <DetailRow
                  label="Fulfillment"
                  value={
                    FULFILLMENT_LABELS[
                      request.fulfillment_method
                    ]
                  }
                />
                <DetailRow
                  label="Product price"
                  value={`$${Number(
                    request.product_price_snapshot,
                  ).toFixed(2)}`}
                />
                <DetailRow
                  label="Estimated total"
                  value={`$${estimatedTotal.toFixed(2)}`}
                  emphasized
                />
                <DetailRow
                  label="Requested"
                  value={
                    formatDateTime(request.requested_at) ||
                    ''
                  }
                />
                <DetailRow
                  label="Expires"
                  value={
                    formatDateTime(request.expires_at) ||
                    ''
                  }
                />
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Customer Information
            </h2>

            <p className="mt-4 font-bold text-slate-950">
              {request.customer_name}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {request.customer_email}
            </p>

            {request.customer_phone && (
              <p className="mt-1 text-sm text-slate-600">
                {request.customer_phone}
              </p>
            )}

            {request.customer_note && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Your Note
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {request.customer_note}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              Fulfillment Details
            </h2>

            {address.length > 0 ? (
              <p className="mt-4 text-sm leading-7 text-slate-700">
                {address.join(', ')}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No delivery address is needed for Pickup.
              </p>
            )}

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-900">
                Payment is arranged directly with the shop.
                LocalStreetShop has not collected payment for
                this request.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center shadow-sm">
          <h2 className="text-xl font-extrabold text-blue-950">
            Keep this secure link
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-blue-800">
            This page contains private request information. Keep
            the link secure and do not share it publicly.
          </p>
        </section>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex justify-between gap-5 border-b border-slate-100 pb-3 last:border-b-0">
      <dt className="text-slate-500">{label}</dt>

      <dd
        className={
          emphasized
            ? 'font-extrabold text-blue-700'
            : 'text-right font-bold text-slate-900'
        }
      >
        {value}
      </dd>
    </div>
  );
}