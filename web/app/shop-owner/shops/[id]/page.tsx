'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SEO from '@/app/components/SEO';

type ShopForm = {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  hours: string;
  parking: string;
  story: string;
};

export default function ManageShopPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [form, setForm] = useState<ShopForm>({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    hours: '',
    parking: '',
    story: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        router.push('/login');
        return;
      }

      setUser(authData.user);

      const { data: shopData, error } = await supabase
        .from('shops')
        .select(`
          id,
          name,
          slug,
          description,
          category,
          phone,
          email,
          website,
          instagram,
          facebook,
          hours,
          parking,
          story,
          owner_id,
          approved,
          address,
          street:street_id (
            name,
            slug,
            city:city_id (
              name,
              slug
            )
          )
        `)
        .eq('id', shopId)
        .eq('owner_id', authData.user.id)
        .maybeSingle();

      if (error) {
        alert(`Failed to load shop: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!shopData) {
        alert('Shop not found, or you do not have permission to edit this shop.');
        router.push('/shop-owner/dashboard');
        return;
      }

      let normalizedShop: any = shopData;
      let street = normalizedShop.street;

      if (Array.isArray(street)) street = street[0] || null;

      if (street?.city && Array.isArray(street.city)) {
        street.city = street.city[0] || null;
      }

      normalizedShop = {
        ...normalizedShop,
        street,
      };

      setShop(normalizedShop);

      setForm({
        name: normalizedShop.name || '',
        description: normalizedShop.description || '',
        category: normalizedShop.category || '',
        phone: normalizedShop.phone || '',
        email: normalizedShop.email || '',
        website: normalizedShop.website || '',
        instagram: normalizedShop.instagram || '',
        facebook: normalizedShop.facebook || '',
        hours: normalizedShop.hours || '',
        parking: normalizedShop.parking || '',
        story: normalizedShop.story || '',
      });

      setLoading(false);
    };

    if (shopId) fetchShop();
  }, [shopId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const cleanUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return '';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shop?.id || !user?.id) return;

    setSaving(true);

    const { error } = await supabase
      .from('shops')
      .update({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: cleanUrl(form.website),
        instagram: cleanUrl(form.instagram),
        facebook: cleanUrl(form.facebook),
        hours: form.hours.trim(),
        parking: form.parking.trim(),
        story: form.story.trim(),
      })
      .eq('id', shop.id)
      .eq('owner_id', user.id);

    setSaving(false);

    if (error) {
      alert(`Failed to update shop: ${error.message}`);
      return;
    }

    alert('✅ Shop updated successfully.');
  };

  const city = shop?.street?.city;
  const street = shop?.street;

  const publicHref =
    city?.slug && street?.slug && shop?.slug
      ? `/cities/${city.slug}/${street.slug}/${shop.slug}`
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl bg-white p-6 rounded-xl shadow">
          Loading shop editor...
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title={`Manage ${shop?.name || 'Shop'} | Local Street Shop`}
        description="Edit your shop details on LocalStreetShop."
        url={`https://www.localstreetshop.com/shop-owner/shops/${shopId}`}
        noindex
      />

      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/shop-owner/dashboard"
            className="inline-block mb-6 text-blue-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-blue-700">
                  ✏️ Manage Shop
                </h1>

                <p className="text-gray-600 mt-2">
                  Update your business details shown on your public shop listing.
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {street?.name && <>Street: {street.name}</>}
                  {city?.name && <> | City: {city.name}</>}
                  {shop?.address && <> | Address: {shop.address}</>}
                </p>
              </div>

              {publicHref && (
                <Link
                  href={publicHref}
                  target="_blank"
                  className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                >
                  👁️ View Public Listing
                </Link>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Shop Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Cafe, Restaurant, Clothing, Grocery..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Tell customers what your shop offers..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Our Story
                </label>
                <textarea
                  name="story"
                  value={form.story}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Share your shop story, history, mission, or what makes your business special..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="519-000-0000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="shop@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Website
                </label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="https://instagram.com/yourshop"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    name="facebook"
                    value={form.facebook}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="https://facebook.com/yourshop"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Business Hours
                </label>
                <textarea
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder={`Mon-Fri: 9 AM - 6 PM\nSat: 10 AM - 4 PM\nSun: Closed`}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Parking
                </label>
                <textarea
                  name="parking"
                  value={form.parking}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Street parking available, plaza parking, paid parking nearby..."
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>

                <Link
                  href="/shop-owner/dashboard"
                  className="rounded-full bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}