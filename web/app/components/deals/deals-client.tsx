"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

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

type Province = { id: string; name: string };
type City = { id: string; name: string; slug: string; province_id: string };

type DealsClientProps = {
  deals: Deal[];
  provinces: Province[];
  cities: City[];
  initialProvince: string;
  initialCity: string;
  initialSort: string;
};

export default function DealsClient({
  deals,
  provinces,
  cities,
  initialProvince,
  initialCity,
  initialSort,
}: DealsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filteredCities = useMemo(() => {
    if (!initialProvince) return cities;
    return cities.filter((c) => c.province_id === initialProvince);
  }, [initialProvince, cities]);

  const updateParam = (field: string, value: string | null, resetCity = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(field, value);
    else params.delete(field);

    if (resetCity) params.delete("city");

    const query = params.toString();
    router.push(query ? `/deals?${query}` : "/deals");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
        >
          ← Back
        </button>

        <section className="text-center mb-10">
          <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
            LocalStreetShop Deals
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            🔥 Local Deals Across Canada
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find local products with 50% or more discount from small businesses
            across Canadian cities.
          </p>
        </section>

        <section className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Want your products shown here?
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Shop owners can add products and deals through LocalStreetShop.
            </p>
          </div>

          <Link
            href="/shop-owner"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-semibold shadow transition"
          >
            Add Your Products
          </Link>
        </section>

        <div className="bg-white border rounded-2xl p-4 md:p-5 shadow-sm mb-8">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
              value={initialProvince}
              onChange={(e) => updateParam("province", e.target.value || null, true)}
            >
              <option value="">All Provinces</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
              value={initialCity}
              onChange={(e) => updateParam("city", e.target.value || null)}
            >
              <option value="">All Cities</option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
              value={initialSort}
              onChange={(e) => updateParam("sort", e.target.value || null)}
            >
              <option value="biggest-discount">Biggest Discount</option>
              <option value="lowest-price">Lowest Price</option>
              <option value="highest-price">Highest Price</option>
            </select>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No deals found yet
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Local shops will be adding offers here soon. Try changing your
              province or city filter, or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.product_id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const formattedOriginal =
    deal.original_price != null ? `$${Number(deal.original_price).toFixed(2)}` : null;
  const formattedSale =
    deal.sale_price != null ? `$${Number(deal.sale_price).toFixed(2)}` : null;

  const address = [
    deal.shop_number != null ? String(deal.shop_number) : null,
    deal.street_name,
    deal.city_name,
    deal.province_name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group border border-gray-200 hover:border-blue-300 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-lg bg-white transition hover:-translate-y-1">
      {deal.image_url ? (
        <div className="w-full h-44 overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.image_url}
            alt={deal.product_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-44 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-sm">
          Product image coming soon
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
          {deal.product_name}
        </h2>

        {deal.discount_percent != null && (
          <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
            {Math.round(deal.discount_percent)}% OFF
          </span>
        )}
      </div>

      <div>
        {formattedOriginal && formattedSale ? (
          <div className="flex items-center gap-2">
            <span className="line-through text-gray-400 text-sm">
              {formattedOriginal}
            </span>
            <span className="font-extrabold text-xl text-gray-900">
              {formattedSale}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Pricing info coming soon</span>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <div className="font-semibold text-gray-900">{deal.shop_name}</div>
        {address && <div>{address}</div>}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
        <a
          href={`/shops/${deal.shop_slug}`}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          View Shop
        </a>

        <a
          href={`/shops/${deal.shop_slug}/products`}
          className="text-sm text-gray-600 hover:text-blue-700 hover:underline"
        >
          View Products
        </a>
      </div>

      {deal.is_demo && (
        <div className="mt-1 text-[11px] text-gray-400 italic">
          Demo deal — live offers from local shops will appear here as businesses
          add products.
        </div>
      )}
    </div>
  );
}