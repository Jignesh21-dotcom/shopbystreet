import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 600;

type PageProps = { params: Promise<{ city: string; street: string; shop: string }> };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const normalizeSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-').trim();

async function loadShop(citySlug: string, streetSlug: string, shopSlug: string) {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      id, name, slug, description, story, address, phone, contact, category,
      parking, image_url, website, instagram, owner_id, approved,
      street:streets!inner(id, name, slug,
        city:cities!inner(id, name, slug,
          state:provinces!inner(id, name, slug,
            country:countries!inner(id, name, slug)
          )
        )
      )
    `)
    .eq('slug', shopSlug)
    .eq('approved', true)
    .eq('street.slug', streetSlug)
    .eq('street.city.slug', citySlug)
    .eq('street.city.state.slug', 'gujarat')
    .eq('street.city.state.country.slug', 'india')
    .maybeSingle();

  return { data: data as any, error };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const result = await loadShop(
    normalizeSlug(decodeURIComponent(resolved.city || '')),
    normalizeSlug(decodeURIComponent(resolved.street || '')),
    normalizeSlug(decodeURIComponent(resolved.shop || '')),
  );

  if (!result.data) return { title: 'Shop Not Found | LocalStreetShop India' };

  const shop = result.data;
  const street = Array.isArray(shop.street) ? shop.street[0] : shop.street;
  const city = Array.isArray(street.city) ? street.city[0] : street.city;

  return {
    title: `${shop.name} – ${street.name}, ${city.name} | LocalStreetShop India`,
    description: shop.description || `Discover ${shop.name} in ${city.name}, Gujarat.`,
  };
}

export default async function IndiaShopPage({ params }: PageProps) {
  const resolved = await params;
  const citySlug = normalizeSlug(decodeURIComponent(resolved.city || ''));
  const streetSlug = normalizeSlug(decodeURIComponent(resolved.street || ''));
  const shopSlug = normalizeSlug(decodeURIComponent(resolved.shop || ''));
  const { data: shop, error } = await loadShop(citySlug, streetSlug, shopSlug);

  const streetHref = `/countries/india/gujarat/${citySlug}/streets/${streetSlug}`;

  if (error || !shop) {
    return <StateCard title="Shop not found" message="This business is not available or has not yet been approved." href={streetHref} />;
  }

  const street = Array.isArray(shop.street) ? shop.street[0] : shop.street;
  const city = Array.isArray(street.city) ? street.city[0] : street.city;
  const isClaimed = Boolean(shop.owner_id);
  const productsHref = `${streetHref}/${shop.slug}/products`;
  const mapQuery = encodeURIComponent(`${shop.name}, ${shop.address || street.name}, ${city.name}, Gujarat, India`);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href={streetHref} className="font-bold text-orange-700 hover:underline">← Back to {street.name}</Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl">
          {shop.image_url && <img src={shop.image_url} alt={`${shop.name} storefront`} className="h-80 w-full object-cover" />}

          <div className="bg-gradient-to-r from-orange-600 to-green-700 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">Gujarat Local Business</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{shop.name}</h1>
            {shop.category && <p className="mt-3 text-lg text-orange-50">{shop.category}</p>}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={productsHref} className="rounded-full bg-white px-6 py-3 font-bold text-orange-700">🛍 View Products</Link>
              {!isClaimed && <Link href={`/shop-owner/claim?shopId=${shop.id}`} className="rounded-full bg-yellow-300 px-6 py-3 font-bold text-slate-950">Claim This Business</Link>}
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Info title="Address">{shop.address || 'Address coming soon'}</Info>
            <Info title="Phone">{shop.phone || shop.contact || 'Not available'}</Info>
            <Info title="Category">{shop.category || 'Not available'}</Info>
            <Info title="Parking / Visit Notes">{shop.parking || 'Not available'}</Info>
          </div>

          {(shop.description || shop.story) && (
            <div className="space-y-5 px-6 pb-8 sm:px-8">
              {shop.description && <TextSection title="About this business" text={shop.description} />}
              {shop.story && <TextSection title="Business story" text={shop.story} />}
            </div>
          )}

          <div className="grid gap-5 border-t border-slate-100 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl bg-orange-50 p-5">
              <h2 className="font-black text-orange-900">Visit or connect directly</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                {(shop.phone || shop.contact) && <a href={`tel:${shop.phone || shop.contact}`} className="rounded-full bg-white px-4 py-2 text-orange-700">Call Shop</a>}
                {shop.website && <a href={shop.website} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-orange-700">Website</a>}
                {shop.instagram && <a href={shop.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-orange-700">Instagram</a>}
              </div>
            </div>
            <iframe title={`Map for ${shop.name}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="h-64 w-full rounded-2xl border-0" loading="lazy" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5"><p className="text-sm font-bold text-slate-500">{title}</p><div className="mt-2 font-semibold text-slate-900">{children}</div></div>;
}
function TextSection({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl bg-slate-50 p-6"><h2 className="font-black text-slate-900">{title}</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{text}</p></div>;
}
function StateCard({ title, message, href }: { title: string; message: string; href: string }) {
  return <main className="min-h-screen bg-orange-50 px-4 py-16"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow"><h1 className="text-3xl font-black">{title}</h1><p className="mt-3 text-slate-600">{message}</p><Link href={href} className="mt-6 inline-flex rounded-full bg-orange-600 px-6 py-3 font-bold text-white">Back to Street</Link></div></main>;
}
