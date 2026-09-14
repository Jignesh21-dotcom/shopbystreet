import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ state: string; city: string; street: string; shop: string }>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const normalizeSlug = (value: string) =>
  decodeURIComponent(value || '').toLowerCase().trim().replace(/\s+/g, '-');

async function loadShop(
  stateSlug: string,
  citySlug: string,
  streetSlug: string,
  shopSlug: string,
) {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      id, name, slug, description, story, address, phone, contact, email,
      category, parking, hours, image_url, website, instagram, facebook,
      owner_id, approved,
      street:streets!inner(
        id, name, display_name, slug,
        city:cities!inner(
          id, name, slug,
          state:provinces!inner(
            id, name, slug,
            country:countries!inner(id, name, slug)
          )
        )
      )
    `)
    .eq('slug', shopSlug)
    .eq('approved', true)
    .eq('street.slug', streetSlug)
    .eq('street.city.slug', citySlug)
    .eq('street.city.state.slug', stateSlug)
    .eq('street.city.state.country.slug', 'united-states')
    .maybeSingle();

  return { data: data as any, error };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const stateSlug = normalizeSlug(resolved.state);
  const citySlug = normalizeSlug(resolved.city);
  const streetSlug = normalizeSlug(resolved.street);
  const shopSlug = normalizeSlug(resolved.shop);

  const result = await loadShop(stateSlug, citySlug, streetSlug, shopSlug);

  if (!result.data) {
    return { title: 'Shop Not Found | LocalStreetShop United States' };
  }

  const shop = result.data;
  const street = Array.isArray(shop.street) ? shop.street[0] : shop.street;
  const city = Array.isArray(street?.city) ? street.city[0] : street?.city;
  const state = Array.isArray(city?.state) ? city.state[0] : city?.state;

  const title = `${shop.name} – ${street?.display_name || street?.name}, ${city?.name} | LocalStreetShop United States`;
  const description =
    shop.description ||
    `Discover ${shop.name} in ${city?.name}, ${state?.name}, the United States on LocalStreetShop.`;
  const canonical = `https://www.localstreetshop.com/countries/united-states/${stateSlug}/${citySlug}/streets/${streetSlug}/${shopSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LocalStreetShop',
      type: 'website',
    },
  };
}

export default async function USShopPage({ params }: PageProps) {
  const resolved = await params;
  const stateSlug = normalizeSlug(resolved.state);
  const citySlug = normalizeSlug(resolved.city);
  const streetSlug = normalizeSlug(resolved.street);
  const shopSlug = normalizeSlug(resolved.shop);

  const { data: shop, error } = await loadShop(
    stateSlug,
    citySlug,
    streetSlug,
    shopSlug,
  );

  const streetHref = `/countries/united-states/${stateSlug}/${citySlug}/streets/${streetSlug}`;

  if (error || !shop) {
    return (
      <StateCard
        title="Shop not found"
        message="This business is not available or has not yet been approved."
        href={streetHref}
      />
    );
  }

  const street = Array.isArray(shop.street) ? shop.street[0] : shop.street;
  const city = Array.isArray(street?.city) ? street.city[0] : street?.city;
  const state = Array.isArray(city?.state) ? city.state[0] : city?.state;

  const isClaimed = Boolean(shop.owner_id);
  const productsHref = `${streetHref}/${shop.slug}/products`;
  const mapQuery = encodeURIComponent(
    `${shop.name}, ${shop.address || street?.name}, ${city?.name}, ${state?.name}, United States`,
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href={streetHref}
          className="font-bold text-blue-700 hover:underline"
        >
          ← Back to {street?.display_name || street?.name}
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-xl">
          {shop.image_url && (
            <img
              src={shop.image_url}
              alt={`${shop.name} storefront`}
              className="h-80 w-full object-cover"
            />
          )}

          <div className="bg-gradient-to-r from-blue-800 to-slate-800 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              {state?.name} Local Business
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{shop.name}</h1>
            {shop.category && (
              <p className="mt-3 text-lg text-blue-50">{shop.category}</p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={productsHref}
                className="rounded-full bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
              >
                🛍 View Products
              </Link>
              {!isClaimed && (
                <Link
                  href={`/shop-owner/claim?shopId=${shop.id}`}
                  className="rounded-full bg-yellow-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-yellow-200"
                >
                  Claim This Business
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Info title="Address">{shop.address || 'Address coming soon'}</Info>
            <Info title="Phone">{shop.phone || shop.contact || 'Not available'}</Info>
            <Info title="Email">{shop.email || 'Not available'}</Info>
            <Info title="Category">{shop.category || 'Not available'}</Info>
            <Info title="Hours">{shop.hours || 'Not available'}</Info>
            <Info title="Parking / Visit Notes">
              {shop.parking || 'Not available'}
            </Info>
          </div>

          {(shop.description || shop.story) && (
            <div className="space-y-5 px-6 pb-8 sm:px-8">
              {shop.description && (
                <TextSection title="About this business" text={shop.description} />
              )}
              {shop.story && (
                <TextSection title="Business story" text={shop.story} />
              )}
            </div>
          )}

          <div className="grid gap-5 border-t border-slate-100 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl bg-blue-50 p-5">
              <h2 className="font-black text-blue-900">Visit or connect directly</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                {(shop.phone || shop.contact) && (
                  <a
                    href={`tel:${shop.phone || shop.contact}`}
                    className="rounded-full bg-white px-4 py-2 text-blue-700"
                  >
                    Call Shop
                  </a>
                )}
                {shop.email && (
                  <a
                    href={`mailto:${shop.email}`}
                    className="rounded-full bg-white px-4 py-2 text-blue-700"
                  >
                    Email
                  </a>
                )}
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-2 text-blue-700"
                  >
                    Website
                  </a>
                )}
                {shop.instagram && (
                  <a
                    href={shop.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-2 text-blue-700"
                  >
                    Instagram
                  </a>
                )}
                {shop.facebook && (
                  <a
                    href={shop.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-2 text-blue-700"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>

            <iframe
              title={`Map for ${shop.name}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-64 w-full rounded-2xl border-0"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <div className="mt-2 font-semibold text-slate-900">{children}</div>
    </div>
  );
}

function TextSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6">
      <h2 className="font-black text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function StateCard({
  title,
  message,
  href,
}: {
  title: string;
  message: string;
  href: string;
}) {
  return (
    <main className="min-h-screen bg-blue-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <Link
          href={href}
          className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-bold text-white"
        >
          Back to Street
        </Link>
      </div>
    </main>
  );
}
