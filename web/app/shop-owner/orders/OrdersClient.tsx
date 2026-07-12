'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'contacted'
  | 'completed'
  | 'cancelled'
  | 'expired';

type Shop = {
  id: string;
  name: string;
};

type OrderRequest = {
  id: string;
  request_number: string;
  shop_id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  quantity: number;
  fulfillment_method: 'pickup' | 'local_delivery' | 'shipping';
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
  expires_at: string;
};

type StatusFilter = 'all' | OrderStatus;

const STATUS_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  accepted: 'border-green-200 bg-green-50 text-green-800',
  contacted: 'border-blue-200 bg-blue-50 text-blue-800',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  declined: 'border-red-200 bg-red-50 text-red-800',
  expired: 'border-slate-200 bg-slate-100 text-slate-700',
  cancelled: 'border-gray-200 bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  contacted: 'Contacted',
  completed: 'Completed',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const FULFILLMENT_LABELS = {
  pickup: 'Pickup',
  local_delivery: 'Local Delivery',
  shipping: 'Shipping',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isExpired(request: OrderRequest) {
  return (
    request.status === 'pending' &&
    new Date(request.expires_at).getTime() <= Date.now()
  );
}

export default function OrdersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedShopId = searchParams.get('shop');
  const requestedStatus = searchParams.get('status');

  const [shops, setShops] = useState<Shop[]>([]);
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    requestedStatus &&
      STATUS_OPTIONS.some(
        (option) => option.value === requestedStatus,
      )
      ? (requestedStatus as StatusFilter)
      : 'all',
  );
  const [shopFilter, setShopFilter] = useState(
    requestedShopId || 'all',
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [shopResponseMessage, setShopResponseMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setLoading(true);
      setErrorMessage('');

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError) {
        setErrorMessage(
          `Authentication error: ${authError.message}`,
        );
        setLoading(false);
        return;
      }

      if (!authData.user) {
        router.push('/login');
        return;
      }

      const { data: shopData, error: shopError } =
        await supabase
          .from('shops')
          .select('id, name')
          .eq('owner_id', authData.user.id)
          .eq('approved', true)
          .order('name', { ascending: true });

      if (!isMounted) return;

      if (shopError) {
        setErrorMessage(
          `Unable to load your shops: ${shopError.message}`,
        );
        setLoading(false);
        return;
      }

      const ownedShops = (shopData || []) as Shop[];
      setShops(ownedShops);

      if (
        requestedShopId &&
        !ownedShops.some((shop) => shop.id === requestedShopId)
      ) {
        setShopFilter('all');
      }

      if (ownedShops.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const shopIds = ownedShops.map((shop) => shop.id);

      const { data: requestData, error: requestError } =
        await supabase
          .from('order_requests')
          .select(`
            id,
            request_number,
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
            expires_at
          `)
          .in('shop_id', shopIds)
          .order('requested_at', { ascending: false });

      if (!isMounted) return;

      if (requestError) {
        setErrorMessage(
          `Unable to load Order Requests: ${requestError.message}`,
        );
        setRequests([]);
        setLoading(false);
        return;
      }

      setRequests((requestData || []) as OrderRequest[]);
      setLoading(false);
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [requestedShopId, router]);

  const effectiveRequests = useMemo(
    () =>
      requests.map((request) =>
        isExpired(request)
          ? { ...request, status: 'expired' as const }
          : request,
      ),
    [requests],
  );

  const filteredRequests = useMemo(
    () =>
      effectiveRequests.filter((request) => {
        const matchesStatus =
          statusFilter === 'all' ||
          request.status === statusFilter;

        const matchesShop =
          shopFilter === 'all' ||
          request.shop_id === shopFilter;

        return matchesStatus && matchesShop;
      }),
    [effectiveRequests, shopFilter, statusFilter],
  );

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: effectiveRequests.length,
      pending: 0,
      accepted: 0,
      contacted: 0,
      completed: 0,
      declined: 0,
      expired: 0,
      cancelled: 0,
    };

    effectiveRequests.forEach((request) => {
      result[request.status] += 1;
    });

    return result;
  }, [effectiveRequests]);

  const openAction = (
    requestId: string,
    action: 'accept' | 'decline',
  ) => {
    setActionRequestId(requestId);
    setActionType(action);
    setActionError('');
    setActionSuccess('');
    setShopResponseMessage('');
  };

  const closeAction = () => {
    if (actionLoading) return;

    setActionRequestId(null);
    setActionType(null);
    setActionError('');
    setShopResponseMessage('');
  };

  const submitAction = async () => {
    if (!actionRequestId || !actionType) return;

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(
        `/api/shop-owner/order-requests/${actionRequestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: actionType,
            shopResponseMessage:
              shopResponseMessage.trim() || null,
          }),
        },
      );

      const responseText = await response.text();

      let result: any = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          'The server returned an unexpected response.',
        );
      }

      if (!response.ok) {
        if (result?.code === 'BILLING_REQUIRED') {
          throw new Error(
            'Your 5 introductory free accepted requests have been used. Billing setup is required before you can accept more requests.',
          );
        }

        throw new Error(
          result?.error ||
            `Unable to ${actionType} this request.`,
        );
      }

      const updatedStatus =
        actionType === 'accept' ? 'accepted' : 'declined';

      setRequests((current) =>
        current.map((request) =>
          request.id === actionRequestId
            ? {
                ...request,
                status: updatedStatus,
                shop_response_message:
                  shopResponseMessage.trim() || null,
              }
            : request,
        ),
      );

      setActionSuccess(
        actionType === 'accept'
          ? 'Order Request accepted successfully.'
          : 'Order Request declined successfully.',
      );

      setActionRequestId(null);
      setActionType(null);
      setShopResponseMessage('');
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update this Order Request.',
      );
    } finally {
      setActionLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/shop-owner/dashboard"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Shop Owner Dashboard
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Marketplace Phase 1
          </p>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Order Requests
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">
            Review customer requests submitted to your LocalStreetShop businesses.
            Accept and Decline actions will be added after this read-only view is verified.
          </p>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {actionSuccess && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
            {actionSuccess}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="All Requests"
            value={counts.all}
          />
          <SummaryCard
            label="Pending"
            value={counts.pending}
          />
          <SummaryCard
            label="Accepted"
            value={counts.accepted}
          />
          <SummaryCard
            label="Completed"
            value={counts.completed}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Incoming Requests
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Newest requests appear first.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Shop
                </label>

                <select
                  value={shopFilter}
                  onChange={(event) =>
                    setShopFilter(event.target.value)
                  }
                  className="w-full min-w-52 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="all">All shops</option>

                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as StatusFilter,
                    )
                  }
                  className="w-full min-w-52 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label} ({counts[status.value]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center text-slate-600">
              Loading Order Requests...
            </div>
          ) : shops.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center">
              <h3 className="text-xl font-extrabold text-amber-950">
                No approved shops found
              </h3>

              <p className="mt-2 text-sm text-amber-800">
                Claim or add a shop before receiving Order Requests.
              </p>

              <Link
                href="/shop-owner/claim"
                className="mt-5 inline-flex rounded-full bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
              >
                Claim a Shop
              </Link>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
              <h3 className="text-xl font-extrabold text-blue-950">
                No Order Requests found
              </h3>

              <p className="mt-2 text-sm text-blue-800">
                There are no requests matching the selected filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() =>
                    openAction(request.id, 'accept')
                  }
                  onDecline={() =>
                    openAction(request.id, 'decline')
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {actionRequestId && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Marketplace Phase 1
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              {actionType === 'accept'
                ? 'Accept Order Request?'
                : 'Decline Order Request?'}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {actionType === 'accept'
                ? 'The request will move to Accepted. If this is one of the shop’s first 5 accepted requests, the service fee will be waived.'
                : 'The request will move to Declined. Declined requests do not create a service fee.'}
            </p>

            <div className="mt-6">
              <label
                htmlFor="shopResponseMessage"
                className="block text-sm font-bold text-slate-800"
              >
                Message to customer optional
              </label>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                This message will be visible to the customer on their
                tracking page and included in the status email.
              </p>

              <textarea
                id="shopResponseMessage"
                rows={5}
                maxLength={2000}
                value={shopResponseMessage}
                onChange={(event) =>
                  setShopResponseMessage(event.target.value)
                }
                disabled={actionLoading}
                placeholder={
                  actionType === 'accept'
                    ? 'Example: We have reserved your item until tomorrow at 6 PM. Please bring your request number.'
                    : 'Example: Unfortunately, this item is no longer available. We apologize for the inconvenience.'
                }
                className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-500">
                <span>
                  Do not include private internal notes here.
                </span>

                <span>
                  {shopResponseMessage.length}/2000
                </span>
              </div>
            </div>

            {actionError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAction}
                disabled={actionLoading}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitAction}
                disabled={actionLoading}
                className={`rounded-full px-6 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  actionType === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading
                  ? 'Updating...'
                  : actionType === 'accept'
                    ? 'Accept Request'
                    : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: OrderRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const estimatedTotal =
    Number(request.product_price_snapshot) *
    request.quantity;

  const address = [
    request.delivery_address_line_1,
    request.delivery_address_line_2,
    request.delivery_city,
    request.delivery_province,
    request.delivery_postal_code,
    request.delivery_country,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-950">
              {request.product_name_snapshot}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[request.status]}`}
            >
              {STATUS_LABELS[request.status]}
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {request.shop_name_snapshot}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Request {request.request_number}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-slate-500">
            Requested
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatDateTime(request.requested_at)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Expires {formatDateTime(request.expires_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Customer
          </h4>

          <p className="mt-3 font-bold text-slate-950">
            {request.customer_name}
          </p>

          <p className="mt-1 text-sm text-slate-700">
            <a
              href={`mailto:${request.customer_email}`}
              className="text-blue-700 hover:underline"
            >
              {request.customer_email}
            </a>
          </p>

          {request.customer_phone && (
            <p className="mt-1 text-sm text-slate-700">
              <a
                href={`tel:${request.customer_phone}`}
                className="text-blue-700 hover:underline"
              >
                {request.customer_phone}
              </a>
            </p>
          )}

          {request.customer_note && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Customer Note
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-900">
                {request.customer_note}
              </p>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Request Details
          </h4>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Quantity</dt>
              <dd className="font-bold text-slate-900">
                {request.quantity}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Fulfillment</dt>
              <dd className="font-bold text-slate-900">
                {FULFILLMENT_LABELS[
                  request.fulfillment_method
                ]}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                Product price
              </dt>
              <dd className="font-bold text-slate-900">
                $
                {Number(
                  request.product_price_snapshot,
                ).toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt className="font-bold text-slate-700">
                Estimated total
              </dt>
              <dd className="font-extrabold text-blue-700">
                ${estimatedTotal.toFixed(2)}
              </dd>
            </div>
          </dl>

          {address.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Address
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {address.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
        {request.status === 'pending' ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onDecline}
              className="rounded-full border border-red-200 bg-white px-6 py-3 font-bold text-red-700 transition hover:bg-red-50"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={onAccept}
              className="rounded-full bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
            >
              Accept Request
            </button>
          </div>
        ) : request.status === 'accepted' ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="font-bold text-green-900">
              ✅ Request Accepted
            </p>

            <p className="mt-1 text-sm text-green-800">
              Contact the customer directly to arrange payment and fulfillment.
            </p>
          </div>
        ) : request.status === 'declined' ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-900">
              Request Declined
            </p>

            <p className="mt-1 text-sm text-red-800">
              No service fee applies to this request.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Current status: {STATUS_LABELS[request.status]}
          </p>
        )}
      </div>
    </article>
  );
}