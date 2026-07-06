'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type PaidTier = 'growth' | 'premium';

const benefits = [
  {
    icon: '🏪',
    title: 'Get discovered locally',
    description:
      'Help nearby shoppers find your business by city, street, address, and category.',
  },
  {
    icon: '📦',
    title: 'Showcase your products',
    description:
      'Upload products, prices, photos, and descriptions so customers know what you offer.',
  },
  {
    icon: '❤️',
    title: 'Support local shopping',
    description:
      'Become part of Canada’s Digital Main Street and help customers shop closer to home.',
  },
];

const includedFeatures = [
  'Claim your business profile',
  'Edit business information',
  'Add storefront photos',
  'Upload up to 100 products',
  'Add product prices',
  'Add product descriptions',
  'Business hours',
  'Phone and email',
  'Website link',
  'Instagram and Facebook links',
  'Google Maps location',
  'City and street discovery',
];

const roadmap = [
  {
    phase: 'Now',
    title: 'Founding Business Program',
    items: ['Free business listings', 'Shop owner claims', 'Product showcase', 'Street discovery'],
  },
  {
    phase: 'Next',
    title: 'Local Marketplace Tools',
    items: ['Online ordering', 'Click & Collect', 'Payments', 'Customer inquiries'],
  },
  {
    phase: 'Future',
    title: 'Smarter Local Discovery',
    items: ['AI shopping assistant', 'Business insights', 'Local promotions', 'Customer rewards'],
  },
];

const faqs = [
  {
    question: 'Is LocalStreetShop really free during Phase 1?',
    answer:
      'Yes. During our Founding Business Program, local businesses can claim their listing, update their profile, and showcase products for free.',
  },
  {
    question: 'How many products can I upload?',
    answer:
      'During Phase 1, businesses can upload up to 100 products for free. This gives most shops enough room to build a strong digital storefront.',
  },
  {
    question: 'Do I need my own website?',
    answer:
      'No. LocalStreetShop works whether or not you already have a website. If you do have one, you can add your website link to your profile.',
  },
  {
    question: 'What happens after Phase 1?',
    answer:
      'Core business profiles will remain available. As the platform grows, optional paid services and marketplace tools may be introduced for businesses that want more support.',
  },
  {
    question: 'Can I get help setting up my shop?',
    answer:
      'Yes. The optional Professional Store Setup service is for busy business owners who want help uploading products, organizing details, and improving their listing.',
  },
  {
    question: 'Can customers buy directly on LocalStreetShop?',
    answer:
      'Not yet. The current focus is discovery and product showcase. Online ordering, payments, and Click & Collect are part of the future roadmap.',
  },
];

export default function PricingPage() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserShop = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userData.user.id)
        .eq('approved', true)
        .limit(1)
        .single();

      if (data?.id) {
        setShopId(data.id);
      }
    };

    fetchUserShop();
  }, []);

  const triggerCheckout = async (tier: PaidTier) => {
    setErrorMessage(null);
    setLoadingTier(tier);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user?.email) {
        window.location.href = '/login';
        return;
      }

      if (!shopId) {
        alert('Please register or claim an approved shop profile before requesting this service.');
        window.location.href = '/shop-owner';
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.user.email,
          tier,
          shopId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Unable to start checkout.');
      }

      window.location.href = result.url;
    } catch (error: any) {
      setErrorMessage(error?.message || 'Unable to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-green-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              For Business Owners
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Grow Your Business on Canada&apos;s Digital Main Street
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Join LocalStreetShop and make it easier for nearby customers to discover your
              business, explore your products, and support local shopping in their community.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop-owner/claim"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Claim Your Shop
              </Link>

              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Create Free Account
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                🇨🇦 <span className="block font-semibold text-slate-900">Built in Canada</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                🏪 <span className="block font-semibold text-slate-900">Local First</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                💰 <span className="block font-semibold text-slate-900">Phase 1 Free</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                ❤️ <span className="block font-semibold text-slate-900">Community Focused</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 p-6 text-white">
                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                  <p className="text-sm font-semibold text-blue-50">LocalStreetShop</p>
                  <h2 className="mt-2 text-2xl font-black">Canada&apos;s Digital Main Street</h2>
                  <p className="mt-3 text-sm leading-6 text-blue-50">
                    A place where shoppers discover local businesses street by street.
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    ['☕', 'Coffee shops', 'Fresh drinks and local cafés'],
                    ['👗', 'Boutiques', 'Clothing, gifts, and accessories'],
                    ['📚', 'Bookstores', 'Books, stationery, and more'],
                  ].map(([icon, title, text]) => (
                    <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        {icon}
                      </div>
                      <div>
                        <p className="font-bold">{title}</p>
                        <p className="text-sm text-slate-500">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-green-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-sm font-bold text-green-700">Founding Business Program</p>
              <p className="text-xs text-slate-500">Free access during Phase 1</p>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {errorMessage && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        </section>
      )}

      {/* WHY JOIN */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Why LocalStreetShop?
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            One page. One purpose. One action.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            This page has one goal: help local business owners understand why joining
            LocalStreetShop is worth it.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {benefit.icon}
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{benefit.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDING PROGRAM */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              Founding Business Program
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Phase 1 is free because local businesses deserve a better online presence.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              LocalStreetShop is growing one business at a time. Instead of charging businesses
              before they see value, we&apos;re helping Canadian communities discover local shops first.
            </p>
            <p className="mt-4 leading-7 text-slate-400">
              As the platform grows, we may introduce optional premium services and marketplace
              tools. The core mission stays the same: help people discover and support local businesses.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="rounded-3xl bg-white p-6 text-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
                    Phase 1 Access
                  </p>
                  <h3 className="mt-2 text-3xl font-black">FREE</h3>
                  <p className="mt-2 text-slate-600">For local businesses during the Founding Business Program.</p>
                </div>
                <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                  $0
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {includedFeatures.slice(0, 8).map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                    <span className="font-black text-green-600">✓</span>
                    <span className="font-medium text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/shop-owner/claim"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Claim Your Free Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EVERYTHING INCLUDED */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Everything Included
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Build your digital storefront for free.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Give customers the information they need before they visit your store.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {includedFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-700">
                ✓
              </span>
              <span className="font-semibold text-slate-800">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSIONAL SETUP */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Need a Hand?
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              We can help build your storefront for you.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Some business owners are too busy running their shop to upload products, resize
              images, or organize listings. Professional Store Setup is an optional service for
              owners who want help getting started.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Product upload help',
                'Image optimization',
                'Category organization',
                'SEO-friendly descriptions',
                'Business verification',
                'Priority support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="text-blue-600">✓</span>
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-xl shadow-slate-200">
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Optional Service
              </p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Professional Store Setup</h3>
              <p className="mt-3 leading-7 text-slate-600">
                A one-time setup service for business owners who want LocalStreetShop to help prepare
                their shop profile.
              </p>

              <div className="mt-6 border-y border-slate-100 py-6">
                <span className="text-5xl font-black text-slate-950">$99</span>
                <span className="ml-2 text-sm font-semibold text-slate-500">one-time</span>
              </div>

              <button
                type="button"
                onClick={() => triggerCheckout('premium')}
                disabled={loadingTier !== null}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingTier === 'premium' ? 'Redirecting...' : 'Request Professional Setup'}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                You can also start free and set up your shop yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            The Road Ahead
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Join early and grow with the platform.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            LocalStreetShop is starting with discovery and product showcase. Over time, we&apos;ll
            build more tools to help local businesses sell and connect with customers.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {roadmap.map((step) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                {step.phase}
              </span>
              <h3 className="mt-4 text-xl font-black text-slate-950">{step.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 font-black text-green-600">✓</span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-300">
                No Hidden Fees
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Built to be simple, fair, and local-business friendly.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'No monthly fee during Phase 1',
                'No credit card required to start',
                'No long-term contracts',
                'Built for Canadian businesses',
                'Mobile-friendly shop profiles',
                'Optional paid services only',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="font-black text-green-300">✓</span>
                  <span className="ml-3 font-semibold text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Questions
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-slate-950">
                {faq.question}
                <span className="text-xl text-blue-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-green-500 p-8 text-center text-white shadow-2xl shadow-blue-600/20 sm:p-12">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
            Canada&apos;s Digital Main Street
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Ready to grow your business locally?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
            Claim your shop, showcase your products, and help customers discover what&apos;s available
            on the streets around them.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop-owner/claim"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Claim Your Shop
            </Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}