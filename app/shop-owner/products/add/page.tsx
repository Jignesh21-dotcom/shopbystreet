'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !description || !imageFile) {
      alert('Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      // ✅ 1️⃣ Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('User Data:', userData);
      console.log('User Error:', userError);

      if (userError || !userData.user) {
        throw new Error('User not found.');
      }
      const userId = userData.user.id;

      // ✅ 2️⃣ Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      console.log('Uploading file:', { fileName, imageFile });

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('products')
        .upload(fileName, imageFile);

      console.log('Upload Data:', uploadData);
      console.log('Upload Error:', uploadError);

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Image upload failed, please check your image.');
        setLoading(false);
        return;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
      console.log('Image URL:', imageUrl);

      // ✅ 3️⃣ Save product to Supabase DB
      console.log('Inserting product:', {
        name,
        price: parseFloat(price),
        description,
        image_url: imageUrl,
        owner_id: userId,
      });

      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          price: parseFloat(price), // ✅ make sure it's a number!
          description,
          image_url: imageUrl,
          owner_id: userId,
        },
      ]);

      console.log('Insert Error:', insertError);

      if (insertError) throw insertError;

      alert('Product added successfully!');
      router.push('/shop-owner/products');
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">➕ Add New Product</h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
            className="p-3 rounded-lg border border-gray-300 focus:outline-none"
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
  );
}
