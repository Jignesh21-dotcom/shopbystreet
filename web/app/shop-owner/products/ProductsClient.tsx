'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Product = {
  id: string;
  name: string;
  price: number | null;
  description?: string | null;
  image_url?: string | null;
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data: shops, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userId);

      if (shopError || !shops?.length) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const shopIds = shops.map((shop) => shop.id);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, description, image_url, shop_id')
        .in('shop_id', shopIds)
        .order('name', { ascending: true });

      if (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      window.alert('Failed to delete product. Please try again.');
      return;
    }

    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10 text-gray-900">
      <section className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
              Shop Owner Dashboard
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
              Your Products
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              View, edit, delete, or add products connected to your claimed
              LocalStreetShop businesses.
            </p>
          </div>

          <Link
            href="/shop-owner/products/add"
            className="rounded-full bg-blue-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center text-gray-600">
            Loading your products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
            <h2 className="text-xl font-bold text-blue-900">
              No products listed yet
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-gray-600">
              Start by adding your first product. During Phase 1,
              LocalStreetShop is helping founding businesses build their online
              storefront presence.
            </p>

            <Link
              href="/shop-owner/products/add"
              className="mt-5 inline-block rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {product.image_url ? (
                  <div className="relative h-44 w-full bg-gray-100">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-blue-50 text-sm font-semibold text-blue-700">
                    No image added
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-950">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {product.price !== null
                      ? `$${product.price.toFixed(2)}`
                      : 'Price not added'}
                  </p>

                  {product.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {product.description.length > 100
                        ? `${product.description.slice(0, 100)}...`
                        : product.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/shop-owner/products/edit/${product.id}`}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}