"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

type Province = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
  slug: string;
  province_id: string;
};

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

  // cities belonging to selected province (or all if none selected)
  const filteredCities = useMemo(() => {
    if (!initialProvince) return cities;
    return cities.filter((c) => c.province_id === initialProvince);
  }, [initialProvince, cities]);

  const updateParam = (field: string, value: string | null, resetCity = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(field, value);
    } else {
      params.delete(field);
    }

    if (resetCity) {
      params.delete("city");
    }

    const query = params.toString();
    router.push(query ? `/deals?${query}` : "/deals");
  };

  const handleProvinceChange = (value: string) => {
    updateParam("province", value || null, true);
  };

  const handleCityChange = (value: string) => {
    updateParam("city", value || null);
  };

  const handleSortChange = (value: string) => {
    updateParam("sort", value || null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            50%+ Local Deals Across Canada
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse all items with 50% or more discount from local shops. Filter by
            province and city to find deals near you.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Province filter */}
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={initialProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            <option value="">All Provinces</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* City filter */}
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={initialCity}
            onChange={(e) => handleCityChange(e.target.value)}
          >
            <option value="">All Cities</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={initialSort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="biggest-discount">Biggest Discount</option>
            <option value="lowest-price">Lowest Price</option>
            <option value="highest-price">Highest Price</option>
          </select>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
          No 50%+ deals found yet. Check back soon — local shops will be
          adding new deals here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.product_id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const {
    product_name,
    original_price,
    sale_price,
    discount_percent,
    image_url,
    shop_name,
    shop_slug,
    shop_number,
    street_name,
    city_name,
    province_name,
    is_demo,
  } = deal;

  const formattedOriginal =
    original_price != null ? `$${Number(original_price).toFixed(2)}` : null;
  const formattedSale =
    sale_price != null ? `$${Number(sale_price).toFixed(2)}` : null;

  const addressParts: string[] = [];
  if (shop_number != null) addressParts.push(String(shop_number));
  if (street_name) addressParts.push(street_name);
  if (city_name) addressParts.push(city_name);
  if (province_name) addressParts.push(province_name);
  const address = addressParts.join(", ");

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3 shadow-sm bg-white">
      {image_url ? (
        <div className="w-full h-40 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image_url}
            alt={product_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs">
          No image
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-sm line-clamp-2">{product_name}</h2>
        {discount_percent != null && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
            {Math.round(discount_percent)}% OFF
          </span>
        )}
      </div>

      <div className="text-sm">
        {formattedOriginal && formattedSale ? (
          <div className="flex items-center gap-2">
            <span className="line-through text-gray-400 text-xs">
              {formattedOriginal}
            </span>
            <span className="font-semibold text-base">{formattedSale}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Pricing info coming soon</span>
        )}
      </div>

      <div className="text-xs text-gray-600">
        <div className="font-medium">{shop_name}</div>
        {address && <div>{address}</div>}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2 border-t">
        <a
          href={`/shops/${shop_slug}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View Shop
        </a>
        <a
          href={`/shops/${shop_slug}/products`}
          className="text-xs text-gray-600 hover:underline"
        >
          View Products
        </a>
      </div>

      {is_demo && (
        <div className="mt-1 text-[10px] text-gray-400 italic">
          Sample deal (demo) – will be replaced with live offers from local shops.
        </div>
      )}
    </div>
  );
}
