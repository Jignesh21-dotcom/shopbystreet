import type { Metadata } from 'next';
import Link from 'next/link';
import IndiaProfessionalSetupButton from './IndiaProfessionalSetupButton';

export const metadata: Metadata = {
  title: 'For Business Owners in India | LocalStreetShop',
  description:
    'Claim or add your Indian business, showcase products, and join LocalStreetShop’s founding business program in Gujarat.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/countries/india/business-owners',
  },
  openGraph: {
    title: 'For Business Owners in India | LocalStreetShop',
    description:
      'Join LocalStreetShop India, manage your local business profile, showcase products, and receive customer Order Requests.',
    url: 'https://www.localstreetshop.com/countries/india/business-owners',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

const benefits = [
  {
    icon: '📍',
    title: 'Be discovered locally',
    description:
      'Help shoppers find your business by city, locality, market, street, building, and category.',
  },
  {
    icon: '🏪',
    title: 'Manage your business profile',
    description:
      'Claim an existing listing or add a missing business and keep its information current.',
  },
  {
    icon: '📦',
    title: 'Showcase up to 100 products',
    description:
      'Add product names, photos, descriptions, stock details, and prices displayed in Indian rupees.',
  },
  {
    icon: '📨',
    title: 'Receive Order Requests',
    description:
      'Let customers request products and arrange payment, pickup, delivery, or shipping directly with you.',
  },
];

const freeProfileFeatures = [
  'Claim an existing business listing',
  'Add a business that is not yet listed',
  'Update your business name and description',
  'Show your full address and map location',
  'Add phone, website, and Instagram details',
  'Add business hours and visit information',
  'Appear on India city, locality, and street pages',
  'Access your Shop Owner Dashboard',
];

const foundingFeatures = [
  'Upload up to 100 products',
  'Display product prices in Indian rupees',
  'Add stock and quantity information',
  'Offer pickup, local delivery, or shipping',
  'Receive customer Order Requests',
  'Accept or decline requests from your dashboard',
];

const steps = [
  {
    number: '01',
    title: 'Find or add your business',
    description:
      'Search LocalStreetShop for your listing. Claim it when found, or submit a new business if it is missing.',
  },
  {
    number: '02',
    title: 'Complete your profile',
    description:
      'Add accurate contact details, location information, business hours, photos, and your story.',
  },
  {
    number: '03',
    title: 'Showcase products',
    description:
      'Add products in rupees and choose whether customers can send Order Requests.',
  },
  {
    number: '04',
    title: 'Connect with customers',
    description:
      'Respond from your dashboard and arrange payment and fulfillment directly with the customer.',
  },
];

const faqs = [
  {
    question: 'Is it free to claim or add my business?',
    answer:
      'Yes. During the India founding launch, claiming an existing profile or submitting a new business is free.',
  },
  {
    question: 'How many products can I add?',
    answer:
      'Founding businesses can currently showcase up to 100 products. Product prices are displayed in Indian rupees.',
  },
  {
    question: 'Does LocalStreetShop collect the customer’s product payment?',
    answer:
      'No. The business and customer arrange product payment directly after an Order Request is accepted.',
  },
  {
    question: 'Who handles pickup, delivery, or shipping?',
    answer:
      'Each business chooses the fulfillment methods it offers and handles the final arrangement directly with the customer.',
  },
  {
    question: 'How much is the Order Request marketplace fee in India?',
    answer:
      'Your first 5 accepted Order Requests are free. After that, each additional accepted request has a fixed ₹39 Marketplace Fee. Declined, cancelled, and expired requests are never charged.',
  },
  {
    question: 'What is the ₹1,299 Professional Store Setup service?',
    answer:
      'It is an optional one-time service for business owners who want help preparing their profile, organizing products, optimizing images, and building a polished product showcase. You can always claim and manage your basic profile yourself for free.',
  },
  {
    question: 'What if my business already has a website?',
    answer:
      'You can still use LocalStreetShop for local discovery, link customers to your website, and maintain a profile connected to your city and locality.',
  },
  {
    question: 'Which parts of India are currently available?',
    answer:
      'The India launch is beginning in Gujarat and expanding carefully city by city, locality by locality, and market by market.',
  },
];

export default function IndiaBusinessOwnersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <section className="relative border-b border-orange-100 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-100 blur-3xl" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-green-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <Link
              href="/countries/india"
              className="mb-6 inline-flex text-sm font-bold text-orange-700 hover:underline"
            >
              ← Back to Explore India
            </Link>

            <span className="block w-fit rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              🇮🇳 For India Business Owners
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Bring your local business into India&apos;s digital street-shopping experience.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Claim or add your business, keep your profile accurate, showcase products in Indian
              rupees, and connect with customers through one LocalStreetShop account.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/shop-owner/claim"
                className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Claim Existing Business
              </Link>
              <Link
                href="/countries/india/add-business"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-7 py-4 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Add a New Business
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl shadow-orange-100">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-600 via-orange-500 to-green-700 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-100">
                India Founding Business Program
              </p>
              <h2 className="mt-3 text-3xl font-black">Start free. Pay only for optional services.</h2>
              <p className="mt-3 leading-7 text-orange-50">
                Build your profile and product showcase while LocalStreetShop grows across Gujarat.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  ['₹0', 'Business profile', 'Claim or add your local business'],
                  ['100', 'Products', 'Showcase products with rupee pricing'],
                  ['₹39', 'Accepted Order Request', 'After your first 5 accepted requests free'],
                ].map(([label, title, text]) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                    <div className="flex h-14 min-w-14 items-center justify-center rounded-2xl bg-orange-50 px-2 text-sm font-black text-orange-700">
                      {label}
                    </div>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="text-sm text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            Built for Local Commerce
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            More than another business directory.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            LocalStreetShop recreates local discovery online through cities, localities, markets,
            buildings, streets, businesses, and products.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                {benefit.icon}
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{benefit.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <span className="inline-flex rounded-full bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              ₹0 Business Profile
            </span>
            <h2 className="mt-5 text-3xl font-black">Claim or add your business</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Build a useful local profile without a monthly subscription during the India founding launch.
            </p>
            <div className="mt-6 grid gap-3">
              {freeProfileFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                  <span className="font-black text-green-300">✓</span>
                  <span className="font-medium text-slate-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <span className="inline-flex rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Founding Product Showcase
            </span>
            <h2 className="mt-5 text-3xl font-black">Up to 100 products</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Create a digital product showcase with prices presented correctly in Indian rupees.
            </p>
            <div className="mt-6 grid gap-3">
              {foundingFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                  <span className="font-black text-orange-300">✓</span>
                  <span className="font-medium text-slate-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Simple Setup
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              From local listing to customer connection.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <span className="text-sm font-black text-orange-600">{step.number}</span>
                <h3 className="mt-4 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-green-50 p-7 shadow-xl sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              India Launch Pricing
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              No subscription. No commission. Simple rupee pricing.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Claiming and managing your basic business profile remains free. Your first 5 accepted
              Order Requests are free, then each additional accepted request has a fixed ₹39 fee.
            </p>
          </div>

          <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-3">
            {[
              ['₹0', 'Claim or add', 'Build and manage your basic business profile'],
              ['First 5 free', 'Accepted requests', 'No marketplace fee on your first 5 accepted requests'],
              ['₹39', 'Marketplace fee', 'Per accepted Order Request after your free allowance'],
            ].map(([price, title, text]) => (
              <div key={title} className="rounded-3xl border border-white bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-black text-orange-700">{price}</p>
                <h3 className="mt-3 text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Need Help Getting Started?
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              We can help prepare your digital storefront.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Professional Store Setup is an optional one-time service for owners who want help
              organizing their profile, preparing images, and adding products.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Product upload assistance',
                'Image preparation and optimization',
                'Category organization',
                'Clear product descriptions',
                'Business profile review',
                'Setup support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="font-black text-green-700">✓</span>
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-green-50 p-6 shadow-xl">
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Optional Service
              </p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Professional Store Setup</h3>
              <p className="mt-3 leading-7 text-slate-600">
                One-time assistance to prepare your business profile and product showcase.
              </p>
              <div className="mt-6 border-y border-slate-100 py-6">
                <span className="text-5xl font-black text-slate-950">₹1,299</span>
                <span className="ml-2 text-sm font-semibold text-slate-500">one-time</span>
              </div>
              <IndiaProfessionalSetupButton />
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Optional only. You can claim and manage your basic profile yourself for free.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Questions</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-bold text-slate-950">
                {faq.question}
                <span className="text-xl text-orange-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-br from-orange-600 via-orange-600 to-green-700 p-8 text-center text-white shadow-2xl sm:p-12">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-50">
            Join the Founding Network
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Ready to bring your business to LocalStreetShop India?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-orange-50">
            Claim an existing listing or add your business and help shape the local-shopping experience as we expand across Gujarat.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop-owner/claim" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold text-orange-700 hover:bg-orange-50">
              Claim Existing Business
            </Link>
            <Link href="/countries/india/add-business" className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white hover:bg-white/20">
              Add a New Business
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
