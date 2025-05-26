
import Link from 'next/link';

export default function ProductList() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">📦 Your Products</h1>

        <p className="text-gray-700 mb-6">
          Here you can view and manage all your listed products.
        </p>

        <div className="flex justify-end mb-4">
          <Link
            href="/shop-owner/products/add"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
          >
            ➕ Add New Product
          </Link>
        </div>

        <div className="text-center text-gray-500">
          <p>🛒 No products listed yet.</p>
        </div>
      </div>
    </div>
  );
}
