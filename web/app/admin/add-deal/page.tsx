"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Province = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
  province_id: string;
};

type Shop = {
  id: string;
  name: string;
  slug: string;
  sequence: number | null;
};

export default function AddDealPage() {
  const router = useRouter();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [shopId, setShopId] = useState("");

  const [productName, setProductName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDemo, setIsDemo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load provinces + cities on mount
  useEffect(() => {
    const loadLookups = async () => {
      // Fetch provinces
      const { data: provData, error: provError } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

      if (provError) {
        console.error("Error loading provinces", provError);
      } else if (provData) {
        setProvinces(provData);
      }

      // Fetch ALL cities using pagination
      let allCities: City[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: citiesBatch, error: cityError } = await supabase
          .from("cities")
          .select("id, name, province_id")
          .order("name")
          .range(from, from + batchSize - 1);

        if (cityError) {
          console.error("Error loading cities", cityError);
          break;
        }

        if (citiesBatch && citiesBatch.length > 0) {
          allCities = [...allCities, ...citiesBatch];
          from += batchSize;

          if (citiesBatch.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      setCities(allCities);
    };

    loadLookups();
  }, []);

  // Filter cities by province
  const filteredCities = useMemo(() => {
    if (!provinceId) return cities;
    return cities.filter((c) => c.province_id === provinceId);
  }, [provinceId, cities]);

  // Load shops when city changes
  useEffect(() => {
    const loadShops = async () => {
      if (!cityId) {
        setShops([]);
        return;
      }

      const { data, error } = await supabase
        .from("shops")
        .select("id, name, slug, sequence")
        .eq("city_id", cityId)
        .order("name")
        .limit(5000);

      if (error) {
        console.error("Error loading shops", error);
      } else if (data) {
        setShops(data);
      }
    };

    loadShops();
  }, [cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!shopId) {
      setErrorMsg("Please select a shop.");
      return;
    }

    if (!productName.trim()) {
      setErrorMsg("Please enter a product name.");
      return;
    }

    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);

    if (!original || !sale || original <= 0 || sale <= 0) {
      setErrorMsg("Please enter valid prices for original and sale.");
      return;
    }

    if (sale >= original) {
      setErrorMsg("Sale price should be lower than original price.");
      return;
    }

    const discount = ((original - sale) / original) * 100;

    if (discount < 50) {
      const confirmLow =
        window.confirm(
          `This deal is only ${discount.toFixed(
            1
          )}% off. Continue anyway? It won't appear on /deals until it's 50%+`
        );
      if (!confirmLow) return;
    }

    setLoading(true);

    // Get current user for owner_id
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMsg("You must be logged in to add a deal.");
      return;
    }

    const { error: insertError } = await supabase.from("products").insert({
      name: productName.trim(),
      price: sale, // current selling price
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      owner_id: user.id,
      shop_id: shopId,
      original_price: original,
      sale_price: sale,
      is_active: true,
      is_demo: isDemo,
    });

    setLoading(false);

    if (insertError) {
      console.error("Error inserting deal", insertError);
      setErrorMsg(insertError.message || "Failed to add deal.");
      return;
    }

    setSuccessMsg("Deal added successfully! It will appear on /deals if it's 50%+ off.");
    // reset just some fields
    setProductName("");
    setOriginalPrice("");
    setSalePrice("");
    setDescription("");
    setImageUrl("");
    // you can keep province/city/shop selected for adding multiple deals

    // Optional: redirect directly to /deals
    // router.push("/deals");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Add Deal</h1>
      <p className="text-sm text-gray-600 mb-6">
        Create a new product with original and sale price. If the discount is 50% or
        more, it will automatically appear on the <strong>/deals</strong> page.
      </p>

      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Province */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Province</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setCityId("");
              setShopId("");
              setShops([]);
            }}
          >
            <option value="">Select province</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">City</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setShopId("");
            }}
            disabled={!provinceId}
          >
            <option value="">{provinceId ? "Select city" : "Select province first"}</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shop */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Shop</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            disabled={!cityId}
          >
            <option value="">
              {cityId ? "Select shop" : "Select city first"}
            </option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.sequence != null ? ` (${s.sequence})` : ""}
              </option>
            ))}
          </select>
        </div>

        <hr className="my-4" />

        {/* Product name */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Product / Deal Title</label>
          <input
            type="text"
            className="border rounded-md px-3 py-2 text-sm"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Haircut & Beard Trim Package"
          />
        </div>

        {/* Prices */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Original Price</label>
            <input
              type="number"
              step="0.01"
              className="border rounded-md px-3 py-2 text-sm"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 80"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Sale Price</label>
            <input
              type="number"
              step="0.01"
              className="border rounded-md px-3 py-2 text-sm"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 35"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Image URL (optional)</label>
          <input
            type="text"
            className="border rounded-md px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            className="border rounded-md px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the deal."
          />
        </div>

        {/* Demo flag */}
        <div className="flex items-center gap-2 pt-2">
          <input
            id="isDemo"
            type="checkbox"
            className="h-4 w-4"
            checked={isDemo}
            onChange={(e) => setIsDemo(e.target.checked)}
          />
          <label htmlFor="isDemo" className="text-sm">
            Mark as demo deal (for seeding the site)
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving…" : "Add Deal"}
          </button>
        </div>
      </form>
    </div>
  );
}
