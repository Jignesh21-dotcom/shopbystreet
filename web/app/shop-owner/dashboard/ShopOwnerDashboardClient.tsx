'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type Related<T> = T | T[] | null;

type Country = { id: string; name: string; slug: string };
type Province = { id: string; name: string; slug: string; country: Related<Country> };
type City = { id: string; name: string; slug: string };
type Street = { id: string; name: string; slug: string; city: Related<City> };
type Location = { id: string; name: string; slug: string; location_type: string };

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  approved: boolean;
  street: Related<Street>;
  province: Related<Province>;
  location: Related<Location>;
  pending_order_count: number;
  pending_fee_count: number;
  pending_fee_total: number;
  accepted_request_count: number;
  accepted_this_month_count: number;
  free_requests_remaining: number;
};

type IndiaSubmission = {
  id: string;
  business_name: string;
  category: string | null;
  city_name: string | null;
  state_name: string | null;
  street_or_market: string | null;
  building_name: string | null;
  full_address: string | null;
  status: string;
  created_at: string;
  approved_shop_id: string | null;
  admin_notes: string | null;
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

function one<T>(value: Related<T>): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function formatCurrency(value: unknown) {
  const numericValue = Number(value);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function getNextInvoiceLabel() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(nextMonth);
}

function countryMeta(shop: Shop) {
  const province = one(shop.province);
  const country = one(province?.country || null);
  const slug = country?.slug || 'canada';
  return {
    slug,
    name: country?.name || (slug === 'india' ? 'India' : 'Canada'),
    flag: slug === 'india' ? '🇮🇳' : slug === 'canada' ? '🇨🇦' : '🌍',
  };
}

function publicHref(shop: Shop) {
  const street = one(shop.street);
  const city = one(street?.city || null);
  const province = one(shop.province);
  const country = one(province?.country || null);

  if (!street?.slug || !city?.slug || !shop.slug) return null;

  if (country?.slug === 'india') {
    return `/countries/india/${province?.slug || 'gujarat'}/${city.slug}/streets/${street.slug}/${shop.slug}`;
  }

  return `/cities/${city.slug}/${street.slug}/${shop.slug}`;
}

function locationHref(shop: Shop) {
  const street = one(shop.street);
  const city = one(street?.city || null);
  const province = one(shop.province);
  const country = one(province?.country || null);
  const location = one(shop.location);

  if (country?.slug !== 'india' || !location?.slug || !street?.slug || !city?.slug) return null;
  return `/countries/india/${province?.slug || 'gujarat'}/${city.slug}/streets/${street.slug}/locations/${location.slug}`;
}

function statusClass(status: string) {
  if (status === 'approved') return 'bg-green-100 text-green-800';
  if (status === 'rejected') return 'bg-red-100 text-red-800';
  if (status === 'needs_information') return 'bg-amber-100 text-amber-800';
  return 'bg-yellow-100 text-yellow-800';
}

function FoundingProgramBanner() {
  return (
    <section className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 p-5">
      <h2 className="text-lg font-bold text-blue-800">🚀 Founding Business Program</h2>
      <p className="mt-2 text-sm leading-6 text-gray-700">
        Claim or add your business, keep its information current, showcase products, and receive customer Order Requests from one LocalStreetShop account.
      </p>
    </section>
  );
}

function MarketplaceSummaryCard({ shop }: { shop: Shop }) {
  return (
    <section className="mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Marketplace Billing</p>
          <h3 className="mt-1 text-xl font-extrabold text-slate-950">Marketplace Summary</h3>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${shop.pending_fee_total > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
          {shop.pending_fee_total > 0 ? 'Payment Pending' : 'No Balance Due'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Current Balance</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-950">{formatCurrency(shop.pending_fee_total)}</p>
          <p className="mt-1 text-xs text-amber-800">{shop.pending_fee_count} {shop.pending_fee_count === 1 ? 'charge' : 'charges'}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Accepted This Month</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-950">{shop.accepted_this_month_count}</p>
          <p className="mt-1 text-xs text-blue-800">Free and chargeable requests</p>
        </div>
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-green-700">Free Remaining</p>
          <p className="mt-1 text-2xl font-extrabold text-green-950">{shop.free_requests_remaining}</p>
          <p className="mt-1 text-xs text-green-800">{shop.accepted_request_count} of {INTRODUCTORY_FREE_ACCEPTED_LIMIT} used</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Next Invoice</p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">{shop.pending_fee_total > 0 ? getNextInvoiceLabel() : 'No invoice due'}</p>
          <p className="mt-1 text-xs text-slate-600">Billing remains visible per business</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href={`/shop-owner/billing?shop=${shop.id}`} className="rounded-full bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800">
          View Billing →
        </Link>
      </div>
    </section>
  );
}

export default function ShopOwnerDashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [submissions, setSubmissions] = useState<IndiaSubmission[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (mounted) {
          setErrorMessage(`Authentication error: ${authError.message}`);
          setLoading(false);
        }
        return;
      }
      if (!authData.user) {
        router.push('/login');
        return;
      }
      if (!mounted) return;
      setUser(authData.user);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setErrorMessage('Please log in again to load your businesses.');
        setLoading(false);
        return;
      }

      const dashboardResponse = await fetch('/api/shop-owner/global-dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const dashboardResult = await dashboardResponse.json();
      if (!dashboardResponse.ok) {
        setErrorMessage(dashboardResult?.error || 'Unable to load your businesses.');
        setLoading(false);
        return;
      }

      const ownedShops = (dashboardResult.shops || []).map((shop: Shop) => ({
        ...shop,
        pending_order_count: 0,
        pending_fee_count: 0,
        pending_fee_total: 0,
        accepted_request_count: 0,
        accepted_this_month_count: 0,
        free_requests_remaining: INTRODUCTORY_FREE_ACCEPTED_LIMIT,
      }));

      const summaryResponse = await fetch('/api/shop-owner/marketplace-summary', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const summaryResult = summaryResponse.ok ? await summaryResponse.json() : { shops: [] };
      const summaryByShop = ((summaryResult.shops || []) as MarketplaceSummary[]).reduce<Record<string, MarketplaceSummary>>((map, item) => {
        map[item.shop_id] = item;
        return map;
      }, {});

      const combined = ownedShops.map((shop: Shop) => {
        const summary = summaryByShop[shop.id];
        return {
          ...shop,
          pending_order_count: Number(summary?.pending_order_count) || 0,
          pending_fee_count: Number(summary?.pending_fee_count) || 0,
          pending_fee_total: Number(summary?.pending_fee_total) || 0,
          accepted_request_count: Number(summary?.accepted_request_count) || 0,
          accepted_this_month_count: Number(summary?.accepted_this_month_count) || 0,
          free_requests_remaining: Number.isFinite(Number(summary?.free_requests_remaining))
            ? Number(summary.free_requests_remaining)
            : INTRODUCTORY_FREE_ACCEPTED_LIMIT,
        };
      });

      if (!mounted) return;
      setShops(combined);
      setSubmissions(dashboardResult.indiaSubmissions || []);
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [router]);

  const groupedShops = useMemo(() => {
    return shops.reduce<Record<string, Shop[]>>((groups, shop) => {
      const country = countryMeta(shop);
      groups[country.slug] = groups[country.slug] || [];
      groups[country.slug].push(shop);
      return groups;
    }, {});
  }, [shops]);

  const pendingSubmissions = submissions.filter((submission) => submission.status !== 'approved');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-6 py-9 text-white shadow-xl sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">Global Business Account</p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">Shop Owner Dashboard</h1>
              <p className="mt-4 max-w-3xl text-blue-50">Welcome, <strong>{user?.email}</strong>. Manage every LocalStreetShop business from one shared account.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/shop-owner/businesses/new" className="rounded-full bg-green-500 px-6 py-3 text-center font-black text-white shadow-lg hover:bg-green-600">
                + Add or Claim Business
              </Link>
              <Link href="/shop-owner/orders" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-center font-bold text-white hover:bg-white/20">
                Order Requests
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8"><FoundingProgramBanner /></div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">Loading your global dashboard...</div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{errorMessage}</div>
        ) : (
          <>
            {pendingSubmissions.length > 0 && (
              <section className="mb-8 rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">India submissions</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Pending and reviewed submissions</h2>
                  </div>
                  <Link href="/countries/india/add-business" className="font-bold text-orange-700 hover:text-orange-900">Submit another India business →</Link>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {pendingSubmissions.map((submission) => (
                    <article key={submission.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-950">{submission.business_name}</h3>
                          <p className="mt-1 text-sm text-slate-600">🇮🇳 {submission.city_name}, {submission.state_name}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{submission.building_name || submission.street_or_market || submission.full_address}</p>
                      {submission.admin_notes && <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700"><strong>Admin note:</strong> {submission.admin_notes}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {shops.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-blue-300 bg-white p-10 text-center">
                <h2 className="text-2xl font-black text-slate-950">You do not own an approved business yet</h2>
                <p className="mx-auto mt-3 max-w-2xl text-slate-600">Add a new business or claim a listing in Canada or India. The action remains available after your first business too.</p>
                <Link href="/shop-owner/businesses/new" className="mt-6 inline-flex rounded-full bg-green-600 px-7 py-3 font-black text-white hover:bg-green-700">+ Add or Claim Business</Link>
              </section>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedShops).map(([countrySlug, countryShops]) => {
                  const meta = countryMeta(countryShops[0]);
                  return (
                    <section key={countrySlug}>
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{meta.flag} {meta.name}</h2>
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">{countryShops.length} {countryShops.length === 1 ? 'business' : 'businesses'}</span>
                      </div>

                      <div className="space-y-5">
                        {countryShops.map((shop) => {
                          const street = one(shop.street);
                          const city = one(street?.city || null);
                          const province = one(shop.province);
                          const location = one(shop.location);
                          const shopPublicHref = publicHref(shop);
                          const shopLocationHref = locationHref(shop);

                          return (
                            <article key={shop.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-2xl font-black text-slate-950">{shop.name}</h3>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Approved</span>
                                  </div>
                                  <p className="mt-2 text-slate-600">
                                    {[location?.name, street?.name, city?.name, province?.name].filter(Boolean).join(' · ')}
                                  </p>
                                  {shop.address && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{shop.address}</p>}
                                </div>
                                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{meta.flag} {meta.name}</span>
                              </div>

                              <MarketplaceSummaryCard shop={shop} />

                              <div className="mt-5 flex flex-wrap gap-3">
                                <Link href={`/shop-owner/shops/${shop.id}`} className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-bold text-white hover:bg-yellow-600">✏️ Manage Business</Link>
                                <Link href="/shop-owner/products/add" className="rounded-full bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700">➕ Add Product</Link>
                                <Link href="/shop-owner/products" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">📦 Manage Products</Link>
                                <Link href={`/shop-owner/dashboard/order-settings?shop=${shop.id}`} className="rounded-full bg-purple-600 px-5 py-2 text-sm font-bold text-white hover:bg-purple-700">⚙️ Order Settings</Link>
                                <Link href={`/shop-owner/orders?shop=${shop.id}&status=pending`} className={`rounded-full px-5 py-2 text-sm font-bold text-white ${(shop.pending_order_count || 0) > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                  📥 Order Requests ({shop.pending_order_count || 0})
                                </Link>
                                {shopLocationHref && <Link href={shopLocationHref} target="_blank" className="rounded-full border border-orange-300 bg-orange-50 px-5 py-2 text-sm font-bold text-orange-800 hover:bg-orange-100">🏢 View Location</Link>}
                                {shopPublicHref && <Link href={shopPublicHref} target="_blank" className="rounded-full bg-slate-700 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800">👁️ Public Listing</Link>}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            <section className="mt-10 rounded-[2rem] border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6 text-center">
              <h2 className="text-2xl font-black text-slate-950">Growing your business portfolio?</h2>
              <p className="mt-2 text-slate-600">The Add or Claim button is always available, no matter how many businesses you already manage.</p>
              <Link href="/shop-owner/businesses/new" className="mt-5 inline-flex rounded-full bg-green-600 px-7 py-3 font-black text-white hover:bg-green-700">+ Add or Claim Another Business</Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
