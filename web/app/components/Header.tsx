'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
          <Image
            src="/lss-logo.png"
            alt="LocalStreetShop Logo"
            width={54}
            height={54}
            priority
            className="rounded-xl"
          />

          <div className="leading-none">
            <p className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-blue-700">Local</span>
              <span className="text-blue-700">Street</span>
              <span className="text-blue-700">Shop</span>
            </p>

            <p className="hidden text-[11px] font-medium tracking-wide text-slate-500 lg:block">
              Canada&apos;s Digital Main Street
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="ml-auto inline-flex items-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-bold text-slate-700 lg:flex xl:gap-7">
          <Link href="/" className="whitespace-nowrap transition hover:text-blue-700">
            Home
          </Link>

          <Link href="/live-cities" className="whitespace-nowrap transition hover:text-blue-700">
            Live Cities
          </Link>

          <Link href="/deals" className="whitespace-nowrap transition hover:text-blue-700">
            Deals
          </Link>

          <Link href="/pricing" className="whitespace-nowrap transition hover:text-blue-700">
            For Business Owners
          </Link>

          <Link href="/street-ambassador" className="whitespace-nowrap transition hover:text-blue-700">
            Ambassador
          </Link>

          <Link href="/home-businesses" className="whitespace-nowrap transition hover:text-blue-700">
            Home Businesses
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link
            href="/countries/canada"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Explore Streets
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Login
            </Link>
          ) : (
            <div className="group relative">
              <button
                type="button"
                className="flex max-w-[170px] items-center gap-2 truncate rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
              >
                👤 <span className="truncate">{user.user_metadata?.username || user.email}</span>
              </button>

              <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <Link
                  href="/profile"
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  👤 Profile
                </Link>

                <Link
                  href="/member"
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  🛍️ Account
                </Link>

                <Link
                  href="/shop-owner"
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  🏪 Shop Owner Portal
                </Link>

                {user.user_metadata?.isAdmin && (
                  <Link
                    href="/admin/shops"
                    className="block px-4 py-2.5 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-50"
                  >
                    👑 Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-1 block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            <Link href="/" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Home
            </Link>

            <Link href="/countries/canada" onClick={closeMobileMenu} className="rounded-xl bg-blue-600 px-3 py-2 text-center text-white shadow transition hover:bg-blue-700">
              Explore Streets
            </Link>

            <Link href="/live-cities" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Live Cities
            </Link>

            <Link href="/deals" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Deals
            </Link>

            <Link href="/pricing" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              For Business Owners
            </Link>

            <Link href="/shop-owner" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Shop Owner Portal
            </Link>

            <Link href="/street-ambassador" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Ambassador
            </Link>

            <Link href="/home-businesses" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Home Businesses
            </Link>

            <Link href="/member" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
              Account
            </Link>

            {!user ? (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="mt-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-center font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Login
              </Link>
            ) : (
              <>
                <Link href="/profile" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700">
                  👤 {user.user_metadata?.username || user.email}
                </Link>

                {user.user_metadata?.isAdmin && (
                  <Link href="/admin/shops" onClick={closeMobileMenu} className="rounded-xl px-3 py-2 font-bold text-yellow-700 hover:bg-yellow-50">
                    👑 Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-full bg-red-500 px-4 py-2 font-bold text-white shadow transition hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}