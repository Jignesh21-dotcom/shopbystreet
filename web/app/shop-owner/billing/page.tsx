'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type Shop = {
  id: string;
  name: string;
};

type LedgerStatus =
  | 'pending'
  | 'invoiced'
  | 'paid'
  | 'waived'
  | 'failed'
  | 'refunded'
  | 'cancelled';

type BillingEntry = {
  id: string;
  shop_id: string;
  order_request_id: string;
  amount: number;
  status: LedgerStatus;
  description: string;
  created_at: string;
  invoiced_at: string | null;
  paid_at: string | null;
  waived_at: string | null;
  refunded_at: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  shop_name: string;
  request_number: string | null;
  product_name: string | null;
};

type BillingSummary = {
  currentBalance: number;
  pendingAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  waivedAmount: number;
  pendingCount: number;
  invoicedCount: number;
};

type BillingResponse = {
  shops: Shop[];
  entries: BillingEntry[];
  summary: BillingSummary;
};

const STATUS_STYLES: Record<LedgerStatus, string> = {
  pending:
    'border-amber-200 bg-amber-50 text-amber-800',
  invoiced:
    'border-blue-200 bg-blue-50 text-blue-800',
  paid:
    'border-green-200 bg-green-50 text-green-800',
  waived:
    'border-emerald-200 bg-emerald-50 text-emerald-800',
  failed:
    'border-red-200 bg-red-50 text-red-800',
  refunded:
    'border-purple-200 bg-purple-50 text-purple-800',
  cancelled:
    'border-slate-200 bg-slate-100 text-slate-700',
};

const STATUS_LABELS: Record<LedgerStatus, string> = {
  pending: 'Pending',
  invoiced: 'Invoiced',
  paid: 'Paid',
  waived: 'Waived',
  failed: 'Failed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function formatMoney(value: unknown) {
  const number = Number(value);

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getNextInvoiceDate() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );
}

export default function ShopOwnerBillingPage() {
  const router = useRouter();

  const [billing, setBilling] =
    useState<BillingResponse | null>(null);
  const [shopFilter, setShopFilter] =
    useState('all');
  const [statusFilter, setStatusFilter] =
    useState<'all' | LedgerStatus>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState('');
  const [paymentLoading, setPaymentLoading] =
    useState(false);
  const [paymentError, setPaymentError] =
    useState('');

  const title =
    'Marketplace Billing | LocalStreetShop';
  const description =
    'Review marketplace service fees, balances, waived requests, invoices, and payment history.';
  const url =
    'https://www.localstreetshop.com/shop-owner/billing';

  useEffect(() => {
    let isMounted = true;

    const loadBilling = async () => {
      setLoading(true);
      setErrorMessage('');

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      const accessToken =
        session?.access_token;

      if (sessionError || !accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        '/api/shop-owner/billing',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        },
      );

      const responseText = await response.text();
      let result: any = null;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        result = null;
      }

      if (!isMounted) return;

      if (!response.ok) {
        setErrorMessage(
          result?.error ||
            'Unable to load marketplace billing.',
        );
        setLoading(false);
        return;
      }

      setBilling(result as BillingResponse);
      setLoading(false);
    };

    loadBilling();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const filteredEntries = useMemo(() => {
    const entries = billing?.entries || [];

    return entries.filter((entry) => {
      const matchesShop =
        shopFilter === 'all' ||
        entry.shop_id === shopFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        entry.status === statusFilter;

      return matchesShop && matchesStatus;
    });
  }, [billing, shopFilter, statusFilter]);

  const summary = billing?.summary || {
    currentBalance: 0,
    pendingAmount: 0,
    invoicedAmount: 0,
    paidAmount: 0,
    waivedAmount: 0,
    pendingCount: 0,
    invoicedCount: 0,
  };

  const nextInvoiceDate =
    getNextInvoiceDate();

  const handlePayCurrentBalance = async () => {
    if (summary.currentBalance <= 0) return;

    setPaymentLoading(true);
    setPaymentError('');

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      const accessToken =
        session?.access_token;

      if (sessionError || !accessToken) {
        throw new Error(
          'Please log in again before making a payment.',
        );
      }

      const response = await fetch(
        '/api/shop-owner/billing/checkout',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const responseText =
        await response.text();

      let result: any = null;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Unable to start Stripe Checkout.',
        );
      }

      if (!result?.url) {
        throw new Error(
          'Stripe Checkout URL was not returned.',
        );
      }

      window.location.href = result.url;
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Unable to start payment.',
      );
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={url}
      />

      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/shop-owner/dashboard"
            className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to Shop Owner Dashboard
          </Link>

          <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-sm sm:px-10 sm:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-100">
              Shop Owner Billing
            </p>

            <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
              Marketplace Billing Center
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">
              Review every service-fee entry, track your current
              balance, and pay before month-end or wait for your
              monthly invoice.
            </p>
          </section>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-slate-600">
                Loading marketplace billing...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
              <h2 className="text-xl font-extrabold">
                Unable to load billing
              </h2>

              <p className="mt-2">{errorMessage}</p>
            </div>
          ) : (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Current Balance"
                  value={formatMoney(
                    summary.currentBalance,
                  )}
                  detail={`${summary.pendingCount + summary.invoicedCount} unpaid ${
                    summary.pendingCount +
                      summary.invoicedCount ===
                    1
                      ? 'charge'
                      : 'charges'
                  }`}
                  emphasis
                />

                <SummaryCard
                  label="Pending"
                  value={formatMoney(
                    summary.pendingAmount,
                  )}
                  detail={`${summary.pendingCount} awaiting invoice`}
                />

                <SummaryCard
                  label="Invoiced"
                  value={formatMoney(
                    summary.invoicedAmount,
                  )}
                  detail={`${summary.invoicedCount} invoiced charges`}
                />

                <SummaryCard
                  label="Paid to Date"
                  value={formatMoney(summary.paidAmount)}
                  detail="Recorded paid marketplace fees"
                />
              </section>

              <section className="mt-6 rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                      Flexible Payment
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                      Pay now or wait for your monthly invoice
                    </h2>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      Your current unpaid balance is{' '}
                      <strong className="text-slate-950">
                        {formatMoney(
                          summary.currentBalance,
                        )}
                      </strong>
                      . You will be able to pay this balance
                      whenever you choose. If it remains unpaid,
                      LocalStreetShop will group eligible charges
                      into an invoice on{' '}
                      <strong className="text-slate-950">
                        {formatDate(
                          nextInvoiceDate.toISOString(),
                        )}
                      </strong>
                      .
                    </p>

                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      No payment is taken automatically.
                    </p>
                  </div>

                  <div className="w-full shrink-0 lg:w-auto">
                    {paymentError && (
                      <p className="mb-3 max-w-sm text-sm font-semibold text-red-700">
                        {paymentError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handlePayCurrentBalance}
                      disabled={
                        paymentLoading ||
                        summary.currentBalance <= 0
                      }
                      className="w-full rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 lg:w-auto"
                    >
                      {paymentLoading
                        ? 'Opening Secure Checkout...'
                        : summary.currentBalance > 0
                          ? `Pay ${formatMoney(
                              summary.currentBalance,
                            )} Now`
                          : 'No Balance Due'}
                    </button>
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-950">
                      Billing Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Every waived, pending, invoiced, paid,
                      refunded, or cancelled service-fee entry.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-bold text-slate-700">
                      Shop
                      <select
                        value={shopFilter}
                        onChange={(event) =>
                          setShopFilter(
                            event.target.value,
                          )
                        }
                        className="mt-2 w-full min-w-52 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="all">
                          All shops
                        </option>

                        {(billing?.shops || []).map(
                          (shop) => (
                            <option
                              key={shop.id}
                              value={shop.id}
                            >
                              {shop.name}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label className="text-sm font-bold text-slate-700">
                      Status
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(
                            event.target
                              .value as
                              | 'all'
                              | LedgerStatus,
                          )
                        }
                        className="mt-2 w-full min-w-52 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="all">
                          All statuses
                        </option>
                        <option value="pending">
                          Pending
                        </option>
                        <option value="invoiced">
                          Invoiced
                        </option>
                        <option value="paid">
                          Paid
                        </option>
                        <option value="waived">
                          Waived
                        </option>
                        <option value="refunded">
                          Refunded
                        </option>
                        <option value="cancelled">
                          Cancelled
                        </option>
                        <option value="failed">
                          Failed
                        </option>
                      </select>
                    </label>
                  </div>
                </div>

                {filteredEntries.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
                    <h3 className="text-xl font-extrabold text-blue-950">
                      No billing entries found
                    </h3>

                    <p className="mt-2 text-sm text-blue-800">
                      Billing activity will appear after Order
                      Requests are accepted.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="hidden grid-cols-[1fr_1.4fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600 md:grid">
                      <span>Date</span>
                      <span>Request</span>
                      <span>Shop</span>
                      <span>Status</span>
                      <span className="text-right">
                        Amount
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredEntries.map((entry) => (
                        <article
                          key={entry.id}
                          className="grid gap-3 px-5 py-5 md:grid-cols-[1fr_1.4fr_0.8fr_0.8fr_0.8fr] md:items-center md:gap-4"
                        >
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 md:hidden">
                              Date
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(
                                entry.created_at,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 md:hidden">
                              Request
                            </p>

                            <p className="font-bold text-slate-950">
                              {entry.request_number ||
                                'Marketplace fee'}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {entry.product_name ||
                                entry.description}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 md:hidden">
                              Shop
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {entry.shop_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 md:hidden">
                              Status
                            </p>

                            <span
                              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                                STATUS_STYLES[
                                  entry.status
                                ]
                              }`}
                            >
                              {
                                STATUS_LABELS[
                                  entry.status
                                ]
                              }
                            </span>
                          </div>

                          <div className="md:text-right">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 md:hidden">
                              Amount
                            </p>

                            <p
                              className={`text-lg font-extrabold ${
                                entry.status ===
                                'waived'
                                  ? 'text-green-700'
                                  : 'text-slate-950'
                              }`}
                            >
                              {formatMoney(entry.amount)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  emphasis = false,
}: {
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        emphasis
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p
        className={`text-sm font-bold ${
          emphasis
            ? 'text-amber-700'
            : 'text-slate-500'
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-extrabold ${
          emphasis
            ? 'text-amber-950'
            : 'text-slate-950'
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          emphasis
            ? 'text-amber-800'
            : 'text-slate-500'
        }`}
      >
        {detail}
      </p>
    </div>
  );
}