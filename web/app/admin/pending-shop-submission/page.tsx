'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type RelatedCity = {
  name: string | null;
  slug: string | null;
};

type RelatedStreet = {
  name: string | null;
  slug: string | null;
  city: RelatedCity | RelatedCity[] | null;
};

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  description: string | null;
  parking: string | null;
  approved: boolean;
  owner_id: string | null;
  created_at: string | null;
  street: RelatedStreet | RelatedStreet[] | null;
};

type NormalizedShop = Omit<Shop, 'street'> & {
  street: {
    name: string | null;
    slug: string | null;
    city: RelatedCity | null;
  } | null;
};

function formatSubmittedDate(value: string | null) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizeShop(shop: Shop): NormalizedShop {
  const rawStreet = Array.isArray(shop.street)
    ? shop.street[0] || null
    : shop.street;

  const rawCity = rawStreet?.city;
  const city = Array.isArray(rawCity) ? rawCity[0] || null : rawCity || null;

  return {
    ...shop,
    street: rawStreet
      ? {
          name: rawStreet.name,
          slug: rawStreet.slug,
          city,
        }
      : null,
  };
}

export default function AdminShopModeration() {
  const router = useRouter();

  const [shops, setShops] = useState<NormalizedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingShopId, setProcessingShopId] = useState<string | null>(null);

  const checkAdminAccess = useCallback(async () => {
    setCheckingAccess(true);
    setErrorMessage('');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace('/login');
      return false;
    }

    const { data: adminResult, error: adminError } = await supabase.rpc(
      'is_admin',
    );

    if (adminError) {
      console.error('Admin access check failed:', adminError);
      setErrorMessage(
        'Unable to verify administrator access. Please try again.',
      );
      setCheckingAccess(false);
      return false;
    }

    if (!adminResult) {
      setIsAdmin(false);
      setCheckingAccess(false);
      return false;
    }

    setIsAdmin(true);
    setCheckingAccess(false);
    return true;
  }, [router]);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('shops')
      .select(`
        id,
        name,
        slug,
        address,
        description,
        parking,
        approved,
        owner_id,
        created_at,
        street:street_id (
          name,
          slug,
          city:city_id (
            name,
            slug
          )
        )
      `)
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch pending shops:', error);
      setErrorMessage(`Unable to load pending shops: ${error.message}`);
      setShops([]);
      setLoading(false);
      return;
    }

    setShops(((data || []) as Shop[]).map(normalizeShop));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    const initializePage = async () => {
      const hasAccess = await checkAdminAccess();

      if (!active || !hasAccess) return;

      await fetchShops();
    };

    initializePage();

    return () => {
      active = false;
    };
  }, [checkAdminAccess, fetchShops]);

  const approveShop = async (shop: NormalizedShop) => {
    const confirmed = window.confirm(
      `Approve "${shop.name}" and make it publicly visible?`,
    );

    if (!confirmed) return;

    setProcessingShopId(shop.id);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase
      .from('shops')
      .update({ approved: true })
      .eq('id', shop.id)
      .eq('approved', false);

    if (error) {
      console.error('Failed to approve shop:', error);
      setErrorMessage(`Unable to approve ${shop.name}: ${error.message}`);
      setProcessingShopId(null);
      return;
    }

    setShops((current) =>
      current.filter((currentShop) => currentShop.id !== shop.id),
    );

    setSuccessMessage(
      `${shop.name} was approved and can now appear publicly.`,
    );

    setProcessingShopId(null);
  };

  const deleteShop = async (shop: NormalizedShop) => {
    const confirmed = window.confirm(
      `Permanently delete the pending submission for "${shop.name}"?\n\nUse this only for duplicate, invalid, or rejected submissions. This action cannot be undone.`,
    );

    if (!confirmed) return;

    setProcessingShopId(shop.id);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shop.id)
      .eq('approved', false);

    if (error) {
      console.error('Failed to delete shop:', error);
      setErrorMessage(`Unable to delete ${shop.name}: ${error.message}`);
      setProcessingShopId(null);
      return;
    }

    setShops((current) =>
      current.filter((currentShop) => currentShop.id !== shop.id),
    );

    setSuccessMessage(`${shop.name} was removed from pending submissions.`);
    setProcessingShopId(null);
  };

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Verifying administrator access...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
            Access denied
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Administrator account required
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            This page is available only to authorized LocalStreetShop
            administrators.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Return Home
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title="Pending Shop Submissions | LocalStreetShop Admin"
        description="Review and approve new shops submitted to LocalStreetShop."
        url="https://www.localstreetshop.com/admin/shops"
        noindex
      />

      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/admin"
              className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
            >
              ← Back to Admin Dashboard
            </Link>

            <button
              type="button"
              onClick={fetchShops}
              disabled={loading}
              className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-slate-200">
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-9 text-white sm:px-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
                LocalStreetShop Admin
              </p>

              <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h1 className="text-3xl font-extrabold sm:text-4xl">
                    Pending Shop Submissions
                  </h1>

                  <p className="mt-3 max-w-3xl leading-7 text-blue-50">
                    Review newly submitted businesses before they appear on
                    public city, street, and shop pages.
                  </p>
                </div>

                <div className="w-fit rounded-2xl bg-white/15 px-5 py-3 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
                    Awaiting Review
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    {shops.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold leading-6 text-green-800"
            >
              {successMessage}
            </div>
          )}

          <section className="mt-7">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                Loading pending shops...
              </div>
            ) : shops.length === 0 ? (
              <div className="rounded-3xl border border-green-200 bg-white p-9 text-center shadow-sm">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl"
                  aria-hidden="true"
                >
                  ✓
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-green-800">
                  No pending shops
                </h2>

                <p className="mt-2 text-slate-600">
                  There are no new shop submissions waiting for review.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {shops.map((shop) => {
                  const cityName = shop.street?.city?.name || null;
                  const citySlug = shop.street?.city?.slug || null;
                  const streetName = shop.street?.name || null;
                  const streetSlug = shop.street?.slug || null;

                  const streetHref =
                    citySlug && streetSlug
                      ? `/cities/${citySlug}/${streetSlug}`
                      : null;

                  const isProcessing = processingShopId === shop.id;

                  return (
                    <article
                      key={shop.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
                    >
                      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                              Pending Approval
                            </span>

                            <span className="text-xs font-medium text-slate-500">
                              Submitted {formatSubmittedDate(shop.created_at)}
                            </span>
                          </div>

                          <h2 className="mt-4 text-2xl font-extrabold text-blue-800 sm:text-3xl">
                            {shop.name}
                          </h2>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Address
                              </p>

                              <p className="mt-2 font-semibold text-slate-800">
                                {shop.address || 'No address provided'}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Location
                              </p>

                              <p className="mt-2 font-semibold text-slate-800">
                                {[streetName, cityName]
                                  .filter(Boolean)
                                  .join(', ') || 'No location available'}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Shop URL
                              </p>

                              <p className="mt-2 break-all font-semibold text-slate-800">
                                {shop.slug || 'No slug provided'}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Owner User ID
                              </p>

                              <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                                {shop.owner_id || 'No owner assigned'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Description
                            </p>

                            <p className="mt-2 leading-7 text-slate-700">
                              {shop.description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Parking
                            </p>

                            <p className="mt-2 leading-7 text-slate-700">
                              {shop.parking ||
                                'No parking information provided.'}
                            </p>
                          </div>

                          {streetHref && (
                            <Link
                              href={streetHref}
                              target="_blank"
                              className="mt-5 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
                            >
                              View current public street →
                            </Link>
                          )}
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-48">
                          <button
                            type="button"
                            onClick={() => approveShop(shop)}
                            disabled={isProcessing}
                            className="rounded-full bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? 'Processing...' : '✓ Approve Shop'}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteShop(shop)}
                            disabled={isProcessing}
                            className="rounded-full bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing
                              ? 'Processing...'
                              : '✕ Reject & Delete'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}