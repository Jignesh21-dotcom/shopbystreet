'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const focusMenuItem = (index: number) => {
    const items = menuItemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (items.length === 0) return;

    const nextIndex = (index + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  const handleShopOwnerTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      setDropdownOpen(true);
      requestAnimationFrame(() => focusMenuItem(0));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setDropdownOpen(true);
      requestAnimationFrame(() => focusMenuItem(-1));
    }

    if (event.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuItemRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusMenuItem(currentIndex + 1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusMenuItem(currentIndex - 1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(items.length - 1);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setDropdownOpen(false);
      dropdownButtonRef.current?.focus();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center space-x-2 transition hover:opacity-90 sm:space-x-3"
        >
          <Image
            src="/lss-logo.png"
            alt="LocalStreetShop Logo"
            width={52}
            height={52}
            priority
          />

          <div className="leading-none">
            <h1 className="text-lg font-extrabold tracking-tight sm:text-2xl">
              <span className="text-blue-700">Local</span>
              <span className="text-blue-700">Street</span>
              <span className="text-blue-700">Shop</span>
            </h1>

            <p className="hidden text-[11px] tracking-wide text-gray-500 sm:block">
              The Digital Main Street of Canada
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <nav className="hidden items-center space-x-5 text-gray-700 font-medium md:flex">
        <Link
          href="/"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Home">🏠</span>
          <span>Home</span>
        </Link>

        <Link
          href="/live-cities"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Live Cities">🏙️</span>
          <span>Live Cities</span>
        </Link>

        <Link
          href="/deals"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Deals">🔥</span>
          <span>Deals</span>
        </Link>

        <Link
          href="/member"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Member">👤</span>
          <span>Account</span>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            ref={dropdownButtonRef}
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            onKeyDown={handleShopOwnerTriggerKeyDown}
            className="hover:text-blue-700 transition flex items-center space-x-1 cursor-pointer"
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            aria-label="Open Shop Owner menu"
          >
            <span role="img" aria-label="Shop Owner">🏪</span>
            <span>Shop Owner</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-gray-100 py-2 z-50"
              role="menu"
              aria-label="Shop Owner submenu"
              onKeyDown={handleMenuKeyDown}
            >
              <Link
                href="/shop-owner"
                ref={(el) => {
                  menuItemRefs.current[0] = el;
                }}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition"
                role="menuitem"
              >
                💼 Shop Owner Portal
                <span className="block text-xs text-gray-400 font-normal">
                  Claim, add, or manage your shop listing
                </span>
              </Link>

              <div className="border-t border-gray-100 my-1" />

              <Link
                href="/pricing"
                ref={(el) => {
                  menuItemRefs.current[1] = el;
                }}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition"
                role="menuitem"
              >
                🏷️ Pricing & Tiers
                <span className="block text-xs text-gray-400 font-normal">
                  View features, slots, and promo codes
                </span>
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/street-ambassador"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Street Ambassador">🤝</span>
          <span>Ambassador</span>
        </Link>

        <Link
          href="/home-businesses"
          className="hover:text-blue-700 transition flex items-center space-x-1"
        >
          <span role="img" aria-label="Home Biz">🧵</span>
          <span>Home Biz</span>
        </Link>

        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm shadow"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="text-gray-700 hover:text-blue-700 transition hidden sm:inline"
            >
              👤 {user.user_metadata?.username || user.email}
            </Link>

            {user.user_metadata?.isAdmin && (
              <Link
                href="/admin/shops"
                className="text-sm text-yellow-600 hover:text-yellow-800 font-semibold underline transition"
                title="Go to Admin Panel"
              >
                👑 Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm shadow"
            >
              Logout
            </button>
          </div>
        )}
        </nav>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-gray-700">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🏠 Home</Link>
            <Link href="/live-cities" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🏙️ Live Cities</Link>
            <Link href="/deals" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🔥 Deals</Link>
            <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">👤 Account</Link>
            <Link href="/shop-owner" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🏪 Shop Owner Portal</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🏷️ Pricing & Tiers</Link>
            <Link href="/street-ambassador" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🤝 Ambassador</Link>
            <Link href="/home-businesses" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700">🧵 Home Biz</Link>

            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 rounded-full bg-blue-600 px-4 py-2 text-center text-white shadow transition hover:bg-blue-700"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-blue-50 hover:text-blue-700"
                >
                  👤 {user.user_metadata?.username || user.email}
                </Link>

                {user.user_metadata?.isAdmin && (
                  <Link
                    href="/admin/shops"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-2 py-2 font-semibold text-yellow-700 hover:bg-yellow-50"
                  >
                    👑 Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-full bg-red-500 px-4 py-2 text-white shadow transition hover:bg-red-600"
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