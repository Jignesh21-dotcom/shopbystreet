import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Orders | Shop Owner | LocalStreetShop',
  description:
    'View and manage customer orders for your LocalStreetShop business.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/orders',
  },
};

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/shop-owner"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Shop Owner
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Orders
          </p>

          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Orders are coming soon
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            This page will become your order management center when online
            checkout and customer purchases are enabled on LocalStreetShop.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-blue-700">
              New Orders
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              View incoming customer orders, payment status, and order details.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-blue-700">
              Fulfillment
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track pickup, delivery, completed orders, and customer notes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-blue-700">
              Sales History
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Review past orders, revenue, product performance, and customer
              activity.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Current status
          </h2>

          <p className="mt-3 text-slate-600">
            Product listing is currently the priority for Phase 1. Orders and
            checkout will be added in a future phase after more local businesses
            have claimed their listings and added products.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop-owner/products"
              className="rounded-full bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Manage Products
            </Link>

            <Link
              href="/shop-owner/products/add"
              className="rounded-full border border-blue-200 bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Add Product
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}