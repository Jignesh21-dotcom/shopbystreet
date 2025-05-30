'use client';

import SEO from '@/app/components/SEO';

export default function Orders() {
  return (
    <>
      <SEO
        title="Orders | Shop Owner | Shop Street"
        description="View and manage all customer orders for your shop. Stay on top of your sales and order history."
        url="https://www.localstreetshop.com/shop-owner/orders"
      />

      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">📦 Orders</h1>

          <p className="text-gray-700">
            This page will show all your orders. 🚧 (Coming soon)
          </p>
        </div>
      </div>
    </>
  );
}
