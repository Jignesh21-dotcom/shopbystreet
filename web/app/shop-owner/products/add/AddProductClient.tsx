'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

export default function AddProductClient() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', userData.user.id)
        .eq('approved', true)
        .order('name');

      if (error) {
        setError('Could not load your shops.');
        setPageLoading(false);
        return;
      }

      setShops(data || []);

      if (data && data.length > 0) {
        setSelectedShop(data[0].id);
      }

      setPageLoading(false);
    };

    fetchShops();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price || !description.trim() || !selectedShop) {
      setError('Please fill in all required fields.');
      return;
    }

    const productPrice = Number(price);
    const productSalePrice = salePrice ? Number(salePrice) : null;

    if (Number.isNaN(productPrice) || productPrice <= 0) {
      setError('Please enter a valid product price.');
      return;
    }

    if (
      productSalePrice !== null &&
      (Number.isNaN(productSalePrice) || productSalePrice <= 0)
    ) {
      setError('Please enter a valid sale price.');
      return;
    }

    if (productSalePrice !== null && productSalePrice >= productPrice) {
      setError('Sale price must be lower than the regular price.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error('Please log in again.');
      }

      let imageUrl = null;

      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image must be under 5 MB.');
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
      }

      const discountPercent =
        productSalePrice !== null
          ? Math.round(((productPrice - productSalePrice) / productPrice) * 100)
          : null;

      const { error: insertError } = await supabase.from('products').insert([
        {
          name: name.trim(),
          price: productPrice,
          sale_price: productSalePrice,
          discount_percent: discountPercent,
          description: description.trim(),
          image_url: imageUrl,
          owner_id: userData.user.id,
          shop_id: selectedShop,
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      router.push('/shop-owner/products');
    } catch (err: any) {
      console.error('Product save error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/shop-owner/products"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Products
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-sm sm:px-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Products
          </p>

          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Add a new product
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            Add products to your business listing so local customers can
            discover what you sell. Sale prices may also appear on the Deals
            page when the discount is 50% or more.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {pageLoading ? (
            <p className="text-slate-600">Loading your shops...</p>
          ) : shops.length === 0 ? (
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-950">
                No approved shops found
              </h2>
              <p className="mt-2 text-slate-600">
                Claim or add a shop before adding products.
              </p>

              <Link
                href="/shop-owner/claim"
                className="mt-6 inline-flex rounded-full bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
              >
                Claim Your Shop
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Select Shop
                  </label>
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handmade candle"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Regular Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="29.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Sale Price optional
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="14.99"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the product, size, material, pickup details, or anything customers should know."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Product Image optional
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Max image size: 5 MB.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? 'Saving Product...' : 'Save Product'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}