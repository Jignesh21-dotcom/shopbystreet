'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type OrderRequestRow = {
  id: string;
  request_number: string;
  customer_access_token: string;
  shop_name_snapshot: string;
  product_name_snapshot: string;
  product_image_snapshot: string | null;
  product_price_snapshot: number | string;
  quantity: number;
  fulfillment_method: string;
  status: string;
  requested_at: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending:
    'border-amber-200 bg-amber-50 text-amber-800',
  accepted:
    'border-green-200 bg-green-50 text-green-800',
  declined:
    'border-red-200 bg-red-50 text-red-800',
  completed:
    'border-blue-200 bg-blue-50 text-blue-800',
  cancelled:
    'border-slate-200 bg-slate-100 text-slate-700',
  expired:
    'border-slate-200 bg-slate-100 text-slate-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const FULFILLMENT_LABELS: Record<string, string> = {
  pickup: 'Pickup',
  local_delivery: 'Local Delivery',
  shipping: 'Shipping',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getStatusClasses(status: string) {
  return (
    STATUS_STYLES[status] ||
    'border-slate-200 bg-slate-50 text-slate-700'
  );
}

function getStatusLabel(status: string) {
  return (
    STATUS_LABELS[status] ||
    status.replaceAll('_', ' ')
  );
}

export default function MyOrderRequestsPage() {
  const [requests, setRequests] = useState<OrderRequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const title = 'My Order Requests | LocalStreetShop';
  const description =
    'View and track your LocalStreetShop Order Requests.';
  const url =
    'https://www.localstreetshop.com/my-order-requests';

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setErrorMessage('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(
          'Unable to verify your account. Please try again.',
        );
        setIsLoading(false);
        return;
      }

      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from('order_requests')
        .select(`
          id,
          request_number,
          customer_access_token,
          shop_name_snapshot,
          product_name_snapshot,
          product_image_snapshot,
          product_price_snapshot,
          quantity,
          fulfillment_method,
          status,
          requested_at,
          created_at
        `)
        .eq('customer_user_id', user.id)
        .order('requested_at', {
          ascending: false,
          nullsFirst: false,
        })
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setRequests((data || []) as OrderRequestRow[]);
      setIsLoading(false);
    };

    fetchRequests();
  }, []);

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={url}
      />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-900 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/profile"
            className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to Profile
          </Link>

          <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-9 text-white shadow-sm sm:px-10 sm:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-green-100">
              Shopper Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
              My Order Requests
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
              Review every Order Request linked to your account and
              open the secure tracking page for full details.
            </p>
          </section>

          <section className="mt-6 sm:mt-8">
            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-slate-600">
                  Loading your Order Requests...
                </p>
              </div>
            ) : errorMessage ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-red-900">
                  Unable to load your requests
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            ) : !isLoggedIn ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Log in to view your requests
                </h2>

                <p className="mt-3 text-slate-600">
                  Guest Order Requests remain available through the
                  secure tracking link shown after submission.
                </p>

                <Link
                  href="/login"
                  className="mt-6 inline-flex rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
                >
                  Login
                </Link>
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="text-5xl" aria-hidden="true">
                  🛍️
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
                  No Order Requests yet
                </h2>

                <p className="mt-3 text-slate-600">
                  Requests submitted while logged in will appear here.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/live-cities"
                    className="rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
                  >
                    Browse Live Cities
                  </Link>

                  <Link
                    href="/deals"
                    className="rounded-full border border-blue-200 bg-white px-7 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    View Deals
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-slate-600">
                    {requests.length}{' '}
                    {requests.length === 1
                      ? 'request'
                      : 'requests'}
                  </p>

                  <p className="text-sm text-slate-500">
                    Newest first
                  </p>
                </div>

                <div className="space-y-5">
                  {requests.map((request) => {
                    const unitPrice = Number(
                      request.product_price_snapshot,
                    );

                    const estimatedTotal =
                      Number.isFinite(unitPrice)
                        ? unitPrice * request.quantity
                        : 0;

                    const requestDate =
                      request.requested_at ||
                      request.created_at;

                    return (
                      <article
                        key={request.id}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="grid md:grid-cols-[150px_1fr]">
                          <div className="bg-slate-100">
                            {request.product_image_snapshot ? (
                              <img
                                src={
                                  request.product_image_snapshot
                                }
                                alt={
                                  request.product_name_snapshot
                                }
                                className="h-48 w-full object-cover md:h-full"
                              />
                            ) : (
                              <div className="flex h-48 items-center justify-center text-4xl md:h-full">
                                🛍️
                              </div>
                            )}
                          </div>

                          <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                                  {
                                    request.shop_name_snapshot
                                  }
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                                  {
                                    request.product_name_snapshot
                                  }
                                </h2>
                              </div>

                              <span
                                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                                  request.status,
                                )}`}
                              >
                                {getStatusLabel(
                                  request.status,
                                )}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Request Number
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                  {
                                    request.request_number
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Quantity
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                  {request.quantity}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Estimated Total
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                  {formatMoney(
                                    estimatedTotal,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Fulfillment
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                  {FULFILLMENT_LABELS[
                                    request
                                      .fulfillment_method
                                  ] ||
                                    request.fulfillment_method.replaceAll(
                                      '_',
                                      ' ',
                                    )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm text-slate-500">
                                Requested{' '}
                                {formatDate(requestDate)}
                              </p>

                              <Link
                                href={`/order-request/${encodeURIComponent(
                                  request.request_number,
                                )}?token=${encodeURIComponent(
                                  request.customer_access_token,
                                )}`}
                                className="w-full rounded-full bg-green-600 px-6 py-3 text-center font-bold text-white transition hover:bg-green-700 sm:w-auto"
                              >
                                Track Request →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}