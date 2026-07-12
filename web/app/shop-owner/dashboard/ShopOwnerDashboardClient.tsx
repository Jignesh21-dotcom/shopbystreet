'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

type City = {
  name: string;
  slug: string;
};

type Street = {
  name: string;
  slug: string;
  city: City | City[] | null;
};

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  street: Street | Street[] | null;
  pending_order_count: number;
  pending_fee_count: number;
  pending_fee_total: number;
  accepted_request_count: number;
  accepted_this_month_count: number;
  free_requests_remaining: number;
};

type TierNoticeProps = {
  usageText: string;
  borderClassName: string;
};

type MarketplaceSummary = {
  shop_id: string;
  pending_order_count: number;
  pending_fee_count: number;
  pending_fee_total: number;
  accepted_request_count: number;
  accepted_this_month_count: number;
  free_requests_remaining: number;
};

const INTRODUCTORY_FREE_ACCEPTED_LIMIT = 5;

function FoundingProgramBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-5 rounded-xl mb-6">
      <h2 className="text-lg font-bold text-blue-800 mb-2">🚀 Founding Business Program</h2>

      <p className="text-sm text-gray-700 mb-2">
        LocalStreetShop is building a new way for customers to shop local online.
      </p>

      <p className="text-sm text-gray-700 mb-2">
        During Phase 1, businesses can claim their shop, update their business information, and showcase up to 100 products with images completely free.
      </p>

      <p className="text-sm text-gray-700 mb-2">
        Our vision is to allow customers to browse local streets, discover products from nearby
        businesses, and purchase online directly from local shops without business owners needing
        to build their own website.
      </p>

      <p className="text-sm font-semibold text-green-700">
        🎉 Businesses that join during Phase 1 will receive special Founding Business benefits as
        the platform grows.
      </p>
    </div>
  );
}


function MarketplaceOrderRequestBanner() {
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-7 text-white sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
          LocalStreetShop Marketplace
        </p>

        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Let customers request your products online
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">
          Customers can choose a product, quantity, and fulfillment method.
          You receive the request in your dashboard and by email, then accept
          or decline it with an optional message to the customer.
        </p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-2xl" aria-hidden="true">📥</p>
          <h3 className="mt-2 font-extrabold text-blue-950">
            Receive Requests
          </h3>
          <p className="mt-2 text-sm leading-6 text-blue-800">
            New requests appear in your dashboard and trigger an email
            notification.
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-2xl" aria-hidden="true">✅</p>
          <h3 className="mt-2 font-extrabold text-green-950">
            First 5 Accepted Free
          </h3>
          <p className="mt-2 text-sm leading-6 text-green-800">
            Your first five accepted Order Requests have no marketplace
            service fee.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-2xl" aria-hidden="true">🧾</p>
          <h3 className="mt-2 font-extrabold text-amber-950">
            Simple Monthly Billing
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            After the free requests, each accepted request adds the displayed
            service fee to your pending monthly balance. Declined requests are
            not charged. Invoices are generated monthly, and no payment is
            taken automatically.
          </p>
        </div>
      </div>

      <div className="border-t border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900 sm:px-7">
        <strong>Transparent billing:</strong> Your pending balance is shown
        below and increases only when a chargeable request is accepted.
        LocalStreetShop will later group pending fees into one monthly invoice.
      </div>
    </section>
  );
}

function formatCurrency(value: unknown) {
  const numericValue = Number(value);

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(
    Number.isFinite(numericValue) ? numericValue : 0,
  );
}

function getNextInvoiceLabel() {
  const now = new Date();
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(nextMonth);
}

function normalizeShops(shopData: Shop[] | null): Shop[] {
  return (shopData || []).map((shop) => {
    const streetRaw = Array.isArray(shop.street) ? shop.street[0] || null : shop.street;
    const cityRaw = streetRaw?.city;
    const city = Array.isArray(cityRaw) ? cityRaw[0] || null : cityRaw || null;

    return {
      ...shop,
      street: streetRaw ? { ...streetRaw, city } : null,
      pending_order_count: shop.pending_order_count ?? 0,
      pending_fee_count: shop.pending_fee_count ?? 0,
      pending_fee_total: shop.pending_fee_total ?? 0,
      accepted_request_count: shop.accepted_request_count ?? 0,
      accepted_this_month_count:
        shop.accepted_this_month_count ?? 0,
      free_requests_remaining:
        shop.free_requests_remaining ??
        INTRODUCTORY_FREE_ACCEPTED_LIMIT,
    };
  });
}

function TierNotice({ usageText, borderClassName }: TierNoticeProps) {
  return (
    <div
      className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${borderClassName}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-600">Account Tier:</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold tracking-wide uppercase text-[10px]">
          Free Project Showcase
        </span>
      </div>

      <div className="text-gray-600">
        <span className="font-semibold text-gray-700">Product Usage:</span> {usageText}
      </div>

      <Link
        href="/business-owners"
        className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-sm transition"
      >
        Learn About Business Owner Program
      </Link>
    </div>
  );
}

export default function ShopOwnerDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        if (!isMounted) return;
        setErrorMessage(`Authentication error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        router.push('/login');
        return;
      }

      if (!isMounted) return;
      setUser(authData.user);

      const { data: shopData, error } = await supabase
        .from('shops')
        .select(`
          *,
          street:street_id (
            name,
            slug,
            city:city_id (
              name,
              slug
            )
          )
        `)
        .eq('owner_id', authData.user.id)
        .eq('approved', true)
        .order('name', { ascending: true });

      if (!isMounted) return;

      if (error) {
        setErrorMessage(`Error fetching shops: ${error.message}`);
        setShops([]);
        setLoading(false);
        return;
      }

      const ownedShops = normalizeShops(shopData as Shop[]);

      if (ownedShops.length === 0) {
        setShops([]);
        setLoading(false);
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (sessionError || !accessToken) {
        setErrorMessage(
          'Unable to load marketplace billing. Please log in again.',
        );
        setShops(ownedShops);
        setLoading(false);
        return;
      }

      const summaryResponse = await fetch(
        '/api/shop-owner/marketplace-summary',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        },
      );

      const summaryText = await summaryResponse.text();
      let summaryResult: any = null;

      try {
        summaryResult = summaryText
          ? JSON.parse(summaryText)
          : null;
      } catch {
        summaryResult = null;
      }

      if (!isMounted) return;

      if (!summaryResponse.ok) {
        console.error(
          'Unable to load marketplace summary:',
          summaryResult,
        );

        setErrorMessage(
          summaryResult?.error ||
            'Unable to load marketplace billing summary.',
        );
        setShops(ownedShops);
        setLoading(false);
        return;
      }

      const summaryByShop = (
        (summaryResult?.shops || []) as MarketplaceSummary[]
      ).reduce<Record<string, MarketplaceSummary>>(
        (result, summary) => {
          result[summary.shop_id] = summary;
          return result;
        },
        {},
      );

      const shopsWithMarketplaceSummary = ownedShops.map(
        (shop) => {
          const summary = summaryByShop[shop.id];

          return {
            ...shop,
            pending_order_count:
              Number(summary?.pending_order_count) || 0,
            pending_fee_count:
              Number(summary?.pending_fee_count) || 0,
            pending_fee_total:
              Number(summary?.pending_fee_total) || 0,
            accepted_request_count:
              Number(summary?.accepted_request_count) || 0,
            accepted_this_month_count:
              Number(summary?.accepted_this_month_count) || 0,
            free_requests_remaining:
              Number.isFinite(
                Number(summary?.free_requests_remaining),
              )
                ? Number(summary.free_requests_remaining)
                : INTRODUCTORY_FREE_ACCEPTED_LIMIT,
          };
        },
      );

      setShops(shopsWithMarketplaceSummary);
      setLoading(false);
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-md sm:p-6">
        <h1 className="mb-4 text-2xl font-bold text-blue-700 sm:text-3xl">🛍️ Shop Owner Dashboard</h1>

        <p className="text-gray-700 mb-6">
          Welcome, <strong>{user?.email}</strong>! This is your shop management area.
        </p>

        {loading ? (
          <div className="bg-white border rounded-lg p-4 text-gray-600">Loading your shops...</div>
        ) : errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {errorMessage}
          </div>
        ) : shops.length === 0 ? (
          <>
            <FoundingProgramBanner />

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800">
              <p className="font-semibold">🚨 You have not added or claimed a shop yet.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/shop-owner/claim"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  🔍 Claim Existing Shop
                </Link>

                <Link
                  href="/shop-owner/shops/add"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  ➕ Add New Shop
                </Link>
              </div>

              <TierNotice
                usageText="Claim a shop to unlock 100 free uploads."
                borderClassName="border-yellow-300"
              />

              <p className="mt-3 text-sm text-gray-600">
                If your shop is already listed, claim it. If not, add it as a new shop.
              </p>
            </div>
          </>
        ) : (
          <>
            <FoundingProgramBanner />
            <MarketplaceOrderRequestBanner />

            <div className="space-y-4">
              {shops.map((shop) => {
                const street = Array.isArray(shop.street) ? shop.street[0] || null : shop.street;
                const cityRaw = street?.city;
                const city = Array.isArray(cityRaw) ? cityRaw[0] || null : cityRaw;

                const publicHref =
                  city?.slug && street?.slug && shop?.slug
                    ? `/cities/${city.slug}/${street.slug}/${shop.slug}`
                    : null;

                return (
                  <div
                    key={shop.id}
                    className="border border-gray-200 rounded-xl p-5 bg-green-50"
                  >
                    <h2 className="text-xl font-bold text-green-800 sm:text-2xl">✅ {shop.name}</h2>

                    <p className="text-gray-700 mt-1">
                      {street?.name && <>Street: {street.name}</>}
                      {city?.name && <> | City: {city.name}</>}
                      {shop.address && <> | Address: {shop.address}</>}
                    </p>


                    <section className="mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                            Marketplace Billing
                          </p>

                          <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                            Marketplace Summary
                          </h3>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                            shop.pending_fee_total > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {shop.pending_fee_total > 0
                            ? 'Payment Pending'
                            : 'No Balance Due'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-amber-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            Current Balance
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-amber-950">
                            {formatCurrency(shop.pending_fee_total)}
                          </p>

                          <p className="mt-1 text-xs text-amber-800">
                            {shop.pending_fee_count}{' '}
                            {shop.pending_fee_count === 1
                              ? 'charge'
                              : 'charges'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            Accepted Requests This Month
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-blue-950">
                            {shop.accepted_this_month_count}
                          </p>

                          <p className="mt-1 text-xs text-blue-800">
                            Includes free and chargeable requests
                          </p>
                        </div>

                        <div className="rounded-xl bg-green-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                            Free Requests Remaining
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-green-950">
                            {shop.free_requests_remaining}
                          </p>

                          <p className="mt-1 text-xs text-green-800">
                            {shop.accepted_request_count} of{' '}
                            {INTRODUCTORY_FREE_ACCEPTED_LIMIT} used
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-100 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                            Next Invoice
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-slate-950">
                            {shop.pending_fee_total > 0
                              ? getNextInvoiceLabel()
                              : 'No invoice due'}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {shop.pending_fee_total > 0
                              ? 'One monthly invoice, when fees are due'
                              : 'Charges appear after the first 5 free requests'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                        The first five accepted requests are free. After that,
                        the configured service fee is added only when you accept
                        a request. Declined requests are never charged.
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link
                          href={`/shop-owner/billing?shop=${shop.id}`}
                          className="rounded-full bg-blue-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                          View Billing →
                        </Link>
                      </div>
                    </section>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/shop-owner/shops/${shop.id}`}
                        className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600 max-sm:w-full max-sm:text-center"
                      >
                        ✏️ Manage Shop
                      </Link>

                      <Link
                        href="/shop-owner/products/add"
                        className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 max-sm:w-full max-sm:text-center"
                      >
                        ➕ Add Product
                      </Link>

                      <Link
  href="/business-owners"
  className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-blue-700 max-sm:w-full max-sm:text-center"
>
  🏪 Business Owner Program
</Link>

                      <Link
                        href="/shop-owner/products"
                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 max-sm:w-full max-sm:text-center"
                      >
                        📦 Manage Products
                      </Link>
                      <Link
  href={`/shop-owner/dashboard/order-settings?shop=${shop.id}`}
  className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 max-sm:w-full max-sm:text-center"
>
  ⚙️ Order Settings
</Link>
                     <Link
  href={`/shop-owner/orders?shop=${shop.id}&status=pending`}
  className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition max-sm:w-full max-sm:text-center ${
    (shop.pending_order_count || 0) > 0
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-green-600 hover:bg-green-700'
  }`}
>
  📥 Order Requests
  {(shop.pending_order_count || 0) > 0
    ? ` (${shop.pending_order_count} Pending)`
    : ' (0)'}
</Link>
         

                      {publicHref && (
                        <Link
                          href={publicHref}
                          target="_blank"
                          className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 max-sm:w-full max-sm:text-center"
                        >
                          👁️ View Public Listing
                        </Link>
                      )}

                     <Link
  href="/support"
  className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 max-sm:w-full max-sm:text-center"
>
  💚 Support the Project
</Link>
                    </div>

                    <TierNotice
                      usageText="You currently have access to 100 free product uploads."
                      borderClassName="border-green-200"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}