'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import SEO from '@/components/SEO';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', userId);

      if (!error && data && data.length > 0) {
        setShops(data);
        setSelectedShop(data[0].id);
      }
    };

    fetchShops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !price || !description || !selectedShop) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User not found');

      const { error } = await supabase.from('products').insert([
        {
          name,
          price: parseFloat(price),
          description,
          shop_id: selectedShop,
          owner_id: userId,
        },
      ]);

      if (error) throw error;

      alert('Product added successfully!');
      router.push('/shop-owner/products');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Add Product | Shop Owner"
        description="Submit a new product with description and price under your selected shop."
        url="https://www.localstreetshop.com/shop-owner/products/form"
      />

      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">➕ Add New Product</h1>

          {error && <p className="text-red-600 mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {shops.length > 0 && (
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Select Shop --</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition font-semibold"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
