'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type AdminTool = {
  title: string;
  description: string;
  href: string;
  icon: string;
  buttonLabel: string;
  accentClass: string;
};

const adminTools: AdminTool[] = [
  {
    title: 'Pending Shop Submissions',
    description:
      'Review businesses added by shop owners, approve valid submissions, and remove duplicates or invalid entries.',
    href: '/admin/shops',
    icon: '🏪',
    buttonLabel: 'Review Shops',
    accentClass: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  {
    title: 'Shop Claim Requests',
    description:
      'Review ownership claims for businesses that are already listed and assign approved shops to their owners.',
    href: '/admin/claims',
    icon: '📋',
    buttonLabel: 'Review Claims',
    accentClass: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  {
    title: 'Pending Streets',
    description:
      'Review street submissions before adding them to the LocalStreetShop directory.',
    href: '/admin/pending-streets',
    icon: '🛣️',
    buttonLabel: 'Review Streets',
    accentClass: 'bg-green-50 border-green-200 text-green-900',
  },
  {
    title: 'Add a Deal',
    description:
      'Create marketplace deal content and feature qualifying products for local shoppers.',
    href: '/admin/add-deal',
    icon: '🏷️',
    buttonLabel: 'Add Deal',
    accentClass: 'bg-purple-50 border-purple-200 text-purple-900',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [pendingShopCount, setPendingShopCount] = useState(0);
  const [pendingClaimCount, setPendingClaimCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const initializeAdmin = useCallback(async () => {
    setCheckingAccess(true);
    setLoadingCounts(true);
    setErrorMessage('');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace('/login');
      return;
    }

    const { data: adminResult, error: adminError } = await supabase.rpc(
      'is_admin',
    );

    if (adminError) {
      console.error('Admin access check failed:', adminError);
      setErrorMessage(
        'Unable to verify administrator access. Please sign in again.',
      );
      setCheckingAccess(false);
      setLoadingCounts(false);
      return;
    }

    if (!adminResult) {
      setIsAdmin(false);
      setCheckingAccess(false);
      setLoadingCounts(false);
      return;
    }

    setIsAdmin(true);
    setAdminEmail(user.email || '');
    setCheckingAccess(false);

    const { count, error: countError } = await supabase
      .from('shops')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('approved', false);

    if (countError) {
      console.error('Unable to load pending shop count:', countError);
      setErrorMessage(
        `Admin access is active, but pending shop totals could not be loaded: ${countError.message}`,
      );
    } else {
      setPendingShopCount(count || 0);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      try {
        const claimsResponse = await fetch('/api/shop-claims/admin?status=pending', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: 'no-store',
        });

        const claimsResult = await claimsResponse.json();
        if (claimsResponse.ok) {
          setPendingClaimCount(Array.isArray(claimsResult?.claims) ? claimsResult.claims.length : 0);
        } else {
          console.error('Unable to load pending claim count:', claimsResult?.error);
        }
      } catch (claimCountError) {
        console.error('Unable to load pending claim count:', claimCountError);
      }
    }

    setLoadingCounts(false);
  }, [router]);

  useEffect(() => {
    initializeAdmin();
  }, [initializeAdmin]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
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
            Your account does not have permission to access the
            LocalStreetShop Admin Dashboard.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Return Home
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title="Admin Dashboard | LocalStreetShop"
        description="LocalStreetShop administrative dashboard."
        url="https://www.localstreetshop.com/admin"
        noindex
      />

      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/20">
            <div className="px-6 py-10 sm:px-10 sm:py-12">
              <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
                    LocalStreetShop Administration
                  </p>

                  <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Admin Dashboard
                  </h1>

                  <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-50">
                    Review submissions, manage platform content, and protect the
                    quality of Canada&apos;s Digital Main Street.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 px-5 py-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
                    Signed in as
                  </p>

                  <p className="mt-1 break-all font-bold">
                    {adminEmail || 'Administrator'}
                  </p>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-3 text-sm font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </section>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-900"
            >
              {errorMessage}
            </div>
          )}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Pending Shops
              </p>

              <p className="mt-2 text-4xl font-extrabold text-amber-950">
                {loadingCounts ? '—' : pendingShopCount}
              </p>

              <p className="mt-2 text-sm text-amber-800">
                New businesses awaiting approval
              </p>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Pending Claims
              </p>

              <p className="mt-2 text-4xl font-extrabold text-blue-950">
                {loadingCounts ? '—' : pendingClaimCount}
              </p>

              <p className="mt-2 text-sm text-blue-800">
                Ownership requests awaiting review
              </p>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Admin Access
              </p>

              <p className="mt-2 text-xl font-extrabold text-blue-950">
                Active
              </p>

              <p className="mt-2 text-sm text-blue-800">
                Verified through the secure admin users table
              </p>
            </div>

            <div className="rounded-3xl border border-green-100 bg-green-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                Approval System
              </p>

              <p className="mt-2 text-xl font-extrabold text-green-950">
                Protected
              </p>

              <p className="mt-2 text-sm text-green-800">
                Pending shops remain hidden until approved
              </p>
            </div>

            <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-700">
                Platform
              </p>

              <p className="mt-2 text-xl font-extrabold text-purple-950">
                LocalStreetShop
              </p>

              <p className="mt-2 text-sm text-purple-800">
                Canada&apos;s Digital Main Street
              </p>
            </div>
          </section>

          <section className="mt-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Administration Tools
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Choose an admin area
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {adminTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200"
                >
                  <div>
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl ${tool.accentClass}`}
                    >
                      {tool.icon}
                    </div>

                    <h3 className="mt-5 text-2xl font-extrabold text-slate-950 transition group-hover:text-blue-700">
                      {tool.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {tool.description}
                    </p>

                    {tool.href === '/admin/shops' &&
                      pendingShopCount > 0 && (
                        <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                          {pendingShopCount}{' '}
                          {pendingShopCount === 1
                            ? 'submission waiting'
                            : 'submissions waiting'}
                        </span>
                      )}


                    {tool.href === '/admin/claims' &&
                      pendingClaimCount > 0 && (
                        <span className="mt-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-800">
                          {pendingClaimCount}{' '}
                          {pendingClaimCount === 1
                            ? 'claim waiting'
                            : 'claims waiting'}
                        </span>
                      )}
                  </div>

                  <div className="mt-7 font-bold text-blue-700">
                    {tool.buttonLabel} →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-blue-950">
              Admin navigation
            </h2>

            <p className="mt-3 max-w-4xl leading-7 text-blue-900">
              This dashboard is the central entry point for all LocalStreetShop
              administration pages. You do not need to add an Admin button to
              the public header because administrators are redirected here
              automatically after login.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}