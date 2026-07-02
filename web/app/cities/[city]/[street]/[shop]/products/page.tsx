import type { Metadata } from 'next';
import Link from 'next/link';
import { getStreetBySlug, getShopsDetailByStreetId } from '@/lib/cacheHelpers';
import { supabase } from '@/lib/supabaseClient';

type PageProps = {
  params: Promise<{
    city: string;
    street: string;
    shop: string;
  }>;
};

const normalizeSlug = (slug: string) =>
  slug?.toLowerCase().replace(/\s+/g, '-').trim();

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const shopSlug = normalizeSlug(decodeURIComponent(resolvedParams.shop || ''));

  return {
    title: `Products from ${shopSlug.replace(/-/g, ' ')}`,
    description: 'Browse products listed by this local business on LocalStreetShop.',
    alternates: {
      canonical: `https://www.localstreetshop.com/cities/${resolvedParams.city}/${resolvedParams.street}/${resolvedParams.shop}/products`,
    },
  };
}

export default async function ShopProductsPage({ params }: PageProps) {
  const resolvedParams = await params;

  const citySlug = normalizeSlug(decodeURIComponent(resolvedParams.city || ''));
  const streetSlug = normalizeSlug(decodeURIComponent(resolvedParams.street || ''));
  const shopSlug = normalizeSlug(decodeURIComponent(resolvedParams.shop || ''));

  const { data: streetData, error: streetError } = await getStreetBySlug(streetSlug);

  if (streetError || !streetData) {
    return <NotFound citySlug={citySlug} streetSlug={streetSlug} />;
  }

  const cityData = Array.isArray(streetData.city)
    ? streetData.city[0]
    : streetData.city;

  if (!cityData || normalizeSlug(cityData.slug) !== citySlug) {
    return <NotFound citySlug={citySlug} streetSlug={streetSlug} />;
  }

  const { data: shops, error: shopsError } = await getShopsDetailByStreetId(
    streetData.id
  );

  if (shopsError || !shops) {
    return <NotFound citySlug={citySlug} streetSlug={streetSlug} />;
  }

  const shop = shops.find((item: any) => item.slug === shopSlug);

  if (!shop) {
    return <NotFound citySlug={citySlug} streetSlug={streetSlug} />;
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, price, description, image_url')
    .eq('shop_id', shop.id)
    .order('name', { ascending: true });

  if (productError) {
    console.error('Failed to fetch shop products:', productError);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12 text-gray-900">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/cities/${citySlug}/${streetSlug}/${shopSlug}`}
          className="mb-6 inline-block font-semibold text-blue-700 hover:underline"
        >
          ← Back to shop
        </Link>

        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
            Shop Products
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
            Products from {shop.name}
          </h1>

          {products && products.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-blue-50 text-sm font-semibold text-blue-700">
                      No image available
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-950">
                      {product.name}
                    </h2>

                    <p className="mt-1 font-semibold text-blue-700">
                      {product.price !== null && product.price !== undefined
                        ? `$${Number(product.price).toFixed(2)}`
                        : 'Price not listed'}
                    </p>

                    {product.description && (
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {product.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-blue-900">
                No products listed yet
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                This business has not added products to LocalStreetShop yet.
                Please check back later or visit the shop profile for contact
                details.
              </p>

              <Link
                href={`/cities/${citySlug}/${streetSlug}/${shopSlug}`}
                className="mt-6 inline-block rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Back to Shop
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function NotFound({
  citySlug,
  streetSlug,
}: {
  citySlug: string;
  streetSlug: string;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">Shop not found</h1>

        <Link
          href={`/cities/${citySlug}/${streetSlug}`}
          className="mt-4 inline-block font-semibold text-blue-700 hover:underline"
        >
          Back to street
        </Link>
      </div>
    </main>
  );
}