'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/components/SEO';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', userId);

      if (!error && data) {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <>
      <SEO
        title="Manage Products | Shop Owner"
        description="View and manage all products listed under your shop."
        url="https://www.localstreetshop.com/shop-owner/products"
      />

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

          {loading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>🛒 No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 shadow-sm bg-white"
                >
                  <h2 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    {product.description?.slice(0, 80)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
