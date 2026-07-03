'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

export default function AddProductClient() {
  const FREE_TIER_LIMIT = 10;

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
  const [productCount, setProductCount] = useState(0);
  const [allowedLimit, setAllowedLimit] = useState<number | null>(FREE_TIER_LIMIT);
  const [isTierLocked, setIsTierLocked] = useState(false);

  const router = useRouter();

  const checkProductLimit = async (shopId: string, limitOverride?: number | null) => {
    if (!shopId) return;

    const activeLimit = limitOverride !== undefined ? limitOverride : allowedLimit;

    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    if (!countError && count !== null) {
      setProductCount(count);
      setIsTierLocked(activeLimit !== null && count >= activeLimit);
      return;
    }

    setProductCount(0);
    setIsTierLocked(false);
  };

  useEffect(() => {
    const fetchShops = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.push('/login');
        return;
      }

      const rawLimit = userData.user.user_metadata?.productLimit;
      let resolvedLimit: number | null = FREE_TIER_LIMIT;

      if (
        rawLimit === null ||
        rawLimit === 'unlimited' ||
        rawLimit === -1
      ) {
        resolvedLimit = null;
      } else {
        const parsedLimit = Number(rawLimit);
        resolvedLimit =
          Number.isNaN(parsedLimit) || parsedLimit <= 0 ? FREE_TIER_LIMIT : parsedLimit;
      }

      setAllowedLimit(resolvedLimit);

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
        await checkProductLimit(data[0].id, resolvedLimit);
      }

      setPageLoading(false);
    };

    fetchShops();
  }, [router]);

  const handleShopChange = async (shopId: string) => {
    setSelectedShop(shopId);
    await checkProductLimit(shopId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (allowedLimit !== null && productCount >= allowedLimit) {
      setError('Upload limit reached. Please upgrade your account tier to add more products.');
      return;
    }

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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (userError || !userData.user || sessionError || !sessionData.session?.access_token) {
        throw new Error('Please log in again.');
      }

      let imageUrl = null;
      let uploadedFileName: string | null = null;

      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image must be under 5 MB.');
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        uploadedFileName = fileName;

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

      const response = await fetch('/api/shop-owner/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          shopId: selectedShop,
          name: name.trim(),
          price: productPrice,
          salePrice: productSalePrice,
          description: description.trim(),
          imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (uploadedFileName) {
          await supabase.storage.from('products').remove([uploadedFileName]);
        }

        if (result?.code === 'TIER_LIMIT_REACHED') {
          const latestCount = Number(result?.count);
          if (!Number.isNaN(latestCount)) {
            setProductCount(latestCount);
          }
          setIsTierLocked(true);
        }

        throw new Error(result?.error || 'Unable to save product.');
      }

      router.push('/shop-owner/products');
    } catch (err: any) {
      console.error('Product save error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/shop-owner/products"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Products
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-9 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Products
          </p>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Add a new product
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:mt-5 sm:text-lg sm:leading-8">
            Add products to your business listing so local customers can
            discover what you sell. Sale prices may also appear on the Deals
            page when the discount is 50% or more.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-8">
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
              <div
                className={`mb-6 rounded-2xl border p-4 text-sm flex flex-wrap items-center justify-between gap-4 ${
                  isTierLocked
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-blue-100 bg-blue-50 text-blue-800'
                }`}
              >
                <div>
                  <span className="font-bold">Current Usage:</span> {productCount} /{' '}
                  {allowedLimit === null ? 'Unlimited' : allowedLimit} listing slots filled.
                </div>

                {isTierLocked && (
                  <Link
                    href="/pricing"
                    className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    Upgrade Tier with Ambassador Code
                  </Link>
                )}
              </div>

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
                    onChange={(e) => handleShopChange(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={isTierLocked || loading}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
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
                      disabled={isTierLocked || loading}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
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
                      disabled={isTierLocked || loading}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={isTierLocked || loading}
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={isTierLocked || loading}
                    className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Max image size: 5 MB.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || isTierLocked}
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