import { Suspense } from 'react';
import OrderSettingsClient from '@/app/shop-owner/dashboard/order-settings/OrderSettingsClient';

export default function OrderSettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-600">Loading order settings...</p>
          </div>
        </main>
      }
    >
      <OrderSettingsClient />
    </Suspense>
  );
}