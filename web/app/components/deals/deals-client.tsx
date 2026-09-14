'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

type Deal = {
  product_id: string;
  product_name: string;
  original_price: number | null;
  sale_price: number | null;
  discount_percent: number | null;
  is_demo: boolean;
  is_active: boolean;
  image_url?: string | null;
  shop_id: string;
  shop_name: string;
  shop_slug: string;
  shop_number: number | null;
  shop_group_name?: string | null;
  street_id: string;
  street_name: string;
  street_slug: string;
  city_id: string;
  city_name: string;
  city_slug: string;
  province_id: string;
  province_name: string;
};

type Country = { id: string; name: string; slug: string };
type Province = { id: string; name: string; slug: string; country_id: string };
type City = { id: string; name: string; slug: string; province_id: string };

type DealsClientProps = {
  deals: Deal[];
  countries: Country[];
  provinces: Province[];
  cities: City[];
  initialCountry: string;
  initialProvince: string;
  initialCity: string;
  initialSort: string;
};

const regionLabel = (countrySlug: string) => {
  if (countrySlug === 'united-states') return 'State';
  if (countrySlug === 'india') return 'State / UT';
  if (countrySlug === 'canada') return 'Province';
  return 'Province / State / Region';
};

export default function DealsClient({
  deals,
  countries,
  provinces,
  cities,
  initialCountry,
  initialProvince,
  initialCity,
  initialSort,
}: DealsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCountry = useMemo(
    () => countries.find((country) => country.slug === initialCountry) || null,
    [countries, initialCountry]
  );

  const filteredProvinces = useMemo(() => {
    if (!selectedCountry) return provinces;
    return provinces.filter((province) => province.country_id === selectedCountry.id);
  }, [selectedCountry, provinces]);

  const filteredCities = useMemo(() => {
    if (initialProvince) return cities.filter((city) => city.province_id === initialProvince);
    if (selectedCountry) {
      const regionIds = new Set(filteredProvinces.map((province) => province.id));
      return cities.filter((city) => regionIds.has(city.province_id));
    }
    return cities;
  }, [initialProvince, selectedCountry, filteredProvinces, cities]);

  const updateParam = (
    field: string,
    value: string | null,
    options?: { resetProvince?: boolean; resetCity?: boolean }
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(field, value);
    else params.delete(field);

    if (options?.resetProvince) params.delete('province');
    if (options?.resetCity) params.delete('city');

    const query = params.toString();
    router.push(query ? `/deals?${query}` : '/deals');
  };

  const currentRegionLabel = regionLabel(initialCountry);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="mb-8 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          ← Back
        </button>

        <section className="mb-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
            LocalStreetShop Deals
          </p>

          <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
            🔥 Local Deals from LocalStreetShop Communities
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose a country, then narrow by region and city to discover local offers from participating businesses.
          </p>
        </section>

        <section className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:flex-row md:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Want your products shown here?</h2>
            <p className="mt-1 text-sm text-gray-600">
              Shop owners can add products and deals through LocalStreetShop.
            </p>
          </div>

          <Link
            href="/shop-owner"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
          >
            Add Your Products
          </Link>
        </section>

        <div className="mb-8 rounded-2xl border bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <select
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              value={initialCountry}
              onChange={(event) =>
                updateParam('country', event.target.value || null, {
                  resetProvince: true,
                  resetCity: true,
                })
              }
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.id} value={country.slug}>
                  {country.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              value={initialProvince}
              onChange={(event) =>
                updateParam('province', event.target.value || null, { resetCity: true })
              }
            >
              <option value="">All {currentRegionLabel}s</option>
              {filteredProvinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              value={initialCity}
              onChange={(event) => updateParam('city', event.target.value || null)}
            >
              <option value="">All Cities</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              value={initialSort}
              onChange={(event) => updateParam('sort', event.target.value || null)}
            >
              <option value="biggest-discount">Biggest Discount</option>
              <option value="lowest-price">Lowest Price</option>
              <option value="highest-price">Highest Price</option>
            </select>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">No deals found yet</h2>
            <p className="mx-auto max-w-xl text-gray-600">
              Local shops will be adding offers here soon. Try changing your country, region, or city filter, or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.product_id}
                deal={deal}
                province={provinces.find((province) => province.id === deal.province_id) || null}
                country={
                  countries.find(
                    (country) =>
                      country.id === provinces.find((province) => province.id === deal.province_id)?.country_id
                  ) || null
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DealCard({
  deal,
  province,
  country,
}: {
  deal: Deal;
  province: Province | null;
  country: Country | null;
}) {
  const currencySymbol = country?.slug === 'india' ? '₹' : '$';
  const formattedOriginal =
    deal.original_price != null ? `${currencySymbol}${Number(deal.original_price).toFixed(2)}` : null;
  const formattedSale =
    deal.sale_price != null ? `${currencySymbol}${Number(deal.sale_price).toFixed(2)}` : null;

  const address = [
    deal.shop_number != null ? String(deal.shop_number) : null,
    deal.street_name,
    deal.city_name,
    deal.province_name,
  ]
    .filter(Boolean)
    .join(', ');

  const shopHref =
    country?.slug === 'canada'
      ? `/cities/${deal.city_slug}/${deal.street_slug}/${deal.shop_slug}`
      : country && province
        ? `/countries/${country.slug}/${province.slug}/${deal.city_slug}/streets/${deal.street_slug}/${deal.shop_slug}`
        : `/shops/${deal.shop_slug}`;

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      {deal.image_url ? (
        <div className="h-44 w-full overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={deal.image_url} alt={deal.product_name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-44 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
          Product image coming soon
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 text-lg font-bold text-gray-900">{deal.product_name}</h2>
        {deal.discount_percent != null && (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            {Math.round(deal.discount_percent)}% OFF
          </span>
        )}
      </div>

      <div>
        {formattedOriginal && formattedSale ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 line-through">{formattedOriginal}</span>
            <span className="text-xl font-extrabold text-gray-900">{formattedSale}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Pricing info coming soon</span>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <div className="font-semibold text-gray-900">{deal.shop_name}</div>
        {address && <div>{address}</div>}
        {country && <div className="mt-1 text-xs font-semibold text-gray-400">{country.name}</div>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
        <Link href={shopHref} className="text-sm font-semibold text-blue-700 hover:underline">
          View Shop
        </Link>
        <Link href={`${shopHref}/products`} className="text-sm text-gray-600 hover:text-blue-700 hover:underline">
          View Products
        </Link>
      </div>

      {deal.is_demo && (
        <div className="mt-1 text-[11px] italic text-gray-400">
          Demo deal — live offers from local shops will appear here as businesses add products.
        </div>
      )}
    </div>
  );
}
