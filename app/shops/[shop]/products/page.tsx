import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type ShopPageProps = {
  params: any; // Temporarily use `any` to bypass type inference issues
};

export default async function ShopProductsPage({ params }: ShopPageProps) {
  // Access the shop parameter
  const shopSlug = decodeURIComponent(params.shop).toLowerCase();

  // 1️⃣ Get shop info including city/street slugs
  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      street:street_id (
        slug,
        city:city_id (
          slug
        )
      )
    `)
    .eq('slug', shopSlug)
    .single();

  if (shopError || !shopData) {
    return <div className="p-8 text-red-600">❌ Shop not found.</div>;
  }

  const citySlug = shopData?.street?.city?.slug || '';
  const streetSlug = shopData?.street?.slug || '';

  // 2️⃣ Get products for this shop
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, price, description, image_url')
    .eq('shop_id', shopData.id);

  if (productError) {
    return <div className="p-8 text-red-600">❌ Failed to fetch products.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 🔙 Back to shop */}
      <Link
        href={`/cities/${citySlug}/${streetSlug}/${params.shop}`}
        className="inline-block mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back to Shop
      </Link>

      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        🛍 Products from {shopData.name}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products listed for this shop yet.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
              <p className="text-blue-600 font-bold mb-1">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}