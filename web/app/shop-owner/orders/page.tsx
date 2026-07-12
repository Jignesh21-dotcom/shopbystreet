import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrdersClient from './OrdersClient';

export const metadata: Metadata = {
  title: 'Order Requests | Shop Owner | LocalStreetShop',
  description:
    'View customer Order Requests for your LocalStreetShop businesses.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/orders',
  },
};

export default function ShopOwnerOrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-slate-600">Loading Order Requests...</p>
          </div>
        </main>
      }
    >
      <OrdersClient />
    </Suspense>
  );
}