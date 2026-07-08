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
    icon: '🌐',
    title: 'Keep your profile accurate',
    description:
      'Claim your basic business profile for free and keep your details up to date.',
  },
  {
    icon: '📦',
    title: 'Showcase products during Phase 1',
    description:
      'Add photos, prices, and up to 100 products for free during our Founding Business Program.',
  },
];

const alwaysFreeFeatures = [
  'Claim your business profile',
  'Edit business name and description',
  'Update address and map location',
  'Add phone and email',
  'Add website link',
  'Add Instagram and Facebook links',
  'Add business hours',
  'Appear on city and street pages',
];

const phaseOneFeatures = [
  'Add storefront photos',
  'Upload up to 100 products',
  'Add product prices',
  'Add product descriptions',
  'Build a digital storefront',
  'Showcase products to nearby shoppers',
];

const roadmap = [
  {
    phase: 'Always',
    title: 'Free Business Profile',
    items: ['Claim shop', 'Update contact details', 'Add website and social links', 'Appear in local discovery'],
  },
  {
    phase: 'Phase 1',
    title: 'Founding Business Program',
    items: ['Free product showcase', 'Storefront photos', 'Up to 100 products', 'Product descriptions and prices'],
  },
  {
    phase: 'Future',
    title: 'Marketplace Tools',
    items: ['Online ordering', 'Click & Collect', 'Payments', 'Customer rewards'],
  },
];

const faqs = [
  {
    question: 'Is claiming my business always free?',
    answer:
      'Yes. Claiming and managing your basic business profile is always free. This includes your business name, address, contact details, website, social links, hours, and local discovery listing.',
  },
  {
    question: 'What is free during Phase 1?',
    answer:
      'During Phase 1, businesses can also add storefront photos and showcase up to 100 products for free as part of our Founding Business Program.',
  },
  {
    question: 'What if I already have my own website?',
    answer:
      'That is perfectly fine. You can still claim your LocalStreetShop profile for free and link visitors to your existing website, Instagram, Facebook, or contact information.',
  },
  {
    question: 'How many products can I upload during Phase 1?',
    answer:
      'During Phase 1, businesses can upload up to 100 products for free. This gives most shops enough room to build a strong digital storefront.',
  },
  {
    question: 'What happens after Phase 1?',
    answer:
      'Your basic business profile will remain free. In the future, optional paid services and marketplace tools may be introduced for businesses that want additional support.',
  },
  {
    question: 'Can I get help setting up my shop?',
    answer:
      'Yes. The optional Professional Store Setup service is for busy business owners who want help uploading products, organizing details, and improving their listing.',
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

      if (data?.id) setShopId(data.id);
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
        headers: { 'Content-Type': 'application/json' },
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
              Claiming and managing your basic business profile is always free. During Phase 1,
              businesses can also add photos and showcase up to 100 products for free.
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
              {[
                ['🇨🇦', 'Built in Canada'],
                ['🏪', 'Profile Always Free'],
                ['📦', 'Phase 1 Products Free'],
                ['❤️', 'Community Focused'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <span className="text-xl">{icon}</span>
                  <span className="mt-1 block font-semibold text-slate-900">{label}</span>
                </div>
              ))}
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
                    ['Free', 'Business profile', 'Claim and update your basic listing'],
                    ['Free', 'Website links', 'Send shoppers to your existing website'],
                    ['Phase 1', 'Product showcase', 'Add photos and up to 100 products'],
                  ].map(([label, title, text]) => (
                    <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-blue-700">
                        {label}
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
              <p className="text-sm font-bold text-green-700">Always free to claim</p>
              <p className="text-xs text-slate-500">Products free during Phase 1</p>
            </div>
          </div>
        </div>
      </section>

      {errorMessage && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Why LocalStreetShop?
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Help customers find your business online.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Whether you already have a website or not, LocalStreetShop helps your business appear
            where nearby shoppers are exploring.
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

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <span className="inline-flex rounded-full bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              Always Free
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight">
              Business profile
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Claiming and managing your basic business profile is always free, even after Phase 1.
              This is perfect for businesses that already have their own website.
            </p>

            <div className="mt-6 grid gap-3">
              {alwaysFreeFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                  <span className="font-black text-green-300">✓</span>
                  <span className="font-medium text-slate-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <span className="inline-flex rounded-full bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Free During Phase 1
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight">
              Product showcase
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              During the Founding Business Program, businesses can also add photos and showcase
              up to 100 products for free.
            </p>

            <div className="mt-6 grid gap-3">
              {phaseOneFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                  <span className="font-black text-blue-300">✓</span>
                  <span className="font-medium text-slate-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                their shop profile and product showcase.
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
                You can also claim your profile for free and set it up yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            The Road Ahead
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Free profile first. Optional tools as we grow.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            LocalStreetShop starts with local discovery. As the platform grows, businesses can choose
            optional services and marketplace tools that help them do more.
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

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-300">
                Simple and Fair
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Built for businesses with or without their own website.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Business profile is always free',
                'No credit card required to claim',
                'Website owners can link out',
                'Product tools free during Phase 1',
                'Optional paid services only',
                'Built for Canadian local businesses',
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
            <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-slate-950">
                {faq.question}
                <span className="text-xl text-blue-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-green-500 p-8 text-center text-white shadow-2xl shadow-blue-600/20 sm:p-12">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
            Canada&apos;s Digital Main Street
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Ready to claim your business profile?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
            Claiming your basic profile is always free. Keep your details up to date and help
            customers discover your business locally.
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