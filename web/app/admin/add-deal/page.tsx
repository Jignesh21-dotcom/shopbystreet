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
  <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
      >
        ← Back
      </button>

      <section className="text-center mb-8">
        <p className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">
          LocalStreetShop Admin
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          Add Deal Product
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Create a product deal with original and sale pricing. Deals with 50%
          or more discount will appear on the public Deals page.
        </p>
      </section>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Province</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
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

          <div>
            <label className="block text-sm font-semibold mb-1">City</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white disabled:bg-gray-100"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setShopId("");
              }}
              disabled={!provinceId}
            >
              <option value="">
                {provinceId ? "Select city" : "Select province first"}
              </option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Shop</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white disabled:bg-gray-100"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              disabled={!cityId}
            >
              <option value="">{cityId ? "Select shop" : "Select city first"}</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.sequence != null ? ` (${s.sequence})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-semibold mb-1">
            Product / Deal Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Haircut & Beard Trim Package"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Original Price
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 80"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Sale Price
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 35"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Image URL optional
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Description optional
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the deal."
          />
        </div>

        <label className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-4">
          <input
            id="isDemo"
            type="checkbox"
            className="h-4 w-4"
            checked={isDemo}
            onChange={(e) => setIsDemo(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            Mark as demo deal for seeding the site
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow transition"
          disabled={loading}
        >
          {loading ? "Saving…" : "Add Deal"}
        </button>
      </form>
    </div>
  </main>
);
}