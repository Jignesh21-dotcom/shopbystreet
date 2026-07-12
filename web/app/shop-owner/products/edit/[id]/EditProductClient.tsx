'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'made_to_order'
  | 'contact_shop';

type Product = {
  id: string;
  name: string;
  price: number | string;
  sale_price: number | string | null;
  description: string | null;
  image_url: string | null;
  shop_id: string;
  accepts_order_requests: boolean;
  stock_status: StockStatus;
  quantity_available: number | null;
  pickup_available: boolean;
  local_delivery_available: boolean;
  shipping_available: boolean;
  fulfillment_notes: string | null;
  maximum_request_quantity: number | null;
};

type ProductForm = {
  name: string;
  price: string;
  salePrice: string;
  description: string;
  imageUrl: string;
  acceptsOrderRequests: boolean;
  stockStatus: StockStatus;
  quantityAvailable: string;
  pickupAvailable: boolean;
  localDeliveryAvailable: boolean;
  shippingAvailable: boolean;
  fulfillmentNotes: string;
  maximumRequestQuantity: string;
};

const DEFAULT_FORM: ProductForm = {
  name: '',
  price: '',
  salePrice: '',
  description: '',
  imageUrl: '',
  acceptsOrderRequests: false,
  stockStatus: 'in_stock',
  quantityAvailable: '',
  pickupAvailable: false,
  localDeliveryAvailable: false,
  shippingAvailable: false,
  fulfillmentNotes: '',
  maximumRequestQuantity: '',
};

const STOCK_STATUS_OPTIONS: Array<{
  value: StockStatus;
  label: string;
  description: string;
}> = [
  {
    value: 'in_stock',
    label: 'In stock',
    description: 'Available now.',
  },
  {
    value: 'low_stock',
    label: 'Low stock',
    description: 'Only a limited quantity remains.',
  },
  {
    value: 'out_of_stock',
    label: 'Out of stock',
    description: 'Temporarily unavailable.',
  },
  {
    value: 'made_to_order',
    label: 'Made to order',
    description: 'Prepared after the customer submits a request.',
  },
  {
    value: 'contact_shop',
    label: 'Contact shop',
    description: 'Availability must be confirmed directly.',
  },
];

export default function EditProductClient() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [shopName, setShopName] = useState('');
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessView, setShowSuccessView] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setPageLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      setShowSuccessView(false);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!isMounted) return;

      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/shop-owner/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const result = await response.json();

      if (!isMounted) return;

      if (!response.ok) {
        setErrorMessage(result?.error || 'Unable to load product.');
        setPageLoading(false);
        return;
      }

      const product = result.product as Product;

      setShopName(result.shop?.name || '');
      setOriginalImageUrl(product.image_url || '');

      setForm({
        name: product.name || '',
        price: String(product.price ?? ''),
        salePrice:
          product.sale_price === null || product.sale_price === undefined
            ? ''
            : String(product.sale_price),
        description: product.description || '',
        imageUrl: product.image_url || '',
        acceptsOrderRequests: product.accepts_order_requests,
        stockStatus: product.stock_status,
        quantityAvailable:
          product.quantity_available === null
            ? ''
            : String(product.quantity_available),
        pickupAvailable: product.pickup_available,
        localDeliveryAvailable: product.local_delivery_available,
        shippingAvailable: product.shipping_available,
        fulfillmentNotes: product.fulfillment_notes || '',
        maximumRequestQuantity:
          product.maximum_request_quantity === null
            ? ''
            : String(product.maximum_request_quantity),
      });

      setPageLoading(false);
    };

    if (productId) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [productId, router]);

  const updateForm = <Key extends keyof ProductForm>(
    key: Key,
    value: ProductForm[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return 'Enter a product name.';
    }

    if (!form.description.trim()) {
      return 'Enter a product description.';
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      return 'Enter a valid regular price.';
    }

    if (form.salePrice.trim()) {
      const salePrice = Number(form.salePrice);

      if (
        !Number.isFinite(salePrice) ||
        salePrice <= 0 ||
        salePrice >= price
      ) {
        return 'Sale price must be greater than 0 and lower than regular price.';
      }
    }

    if (form.quantityAvailable.trim()) {
      const quantity = Number(form.quantityAvailable);

      if (!Number.isInteger(quantity) || quantity < 0) {
        return 'Quantity available must be a whole number of 0 or greater.';
      }
    }

    if (form.maximumRequestQuantity.trim()) {
      const maximum = Number(form.maximumRequestQuantity);

      if (!Number.isInteger(maximum) || maximum < 1) {
        return 'Maximum request quantity must be a whole number of at least 1.';
      }

      if (form.quantityAvailable.trim()) {
        const quantity = Number(form.quantityAvailable);

        if (maximum > quantity) {
          return 'Maximum request quantity cannot exceed quantity available.';
        }
      }
    }

    if (
      form.acceptsOrderRequests &&
      !form.pickupAvailable &&
      !form.localDeliveryAvailable &&
      !form.shippingAvailable
    ) {
      return 'Select at least one fulfillment option before enabling Order Requests.';
    }

    if (
      form.acceptsOrderRequests &&
      (form.stockStatus === 'out_of_stock' ||
        form.quantityAvailable.trim() === '0')
    ) {
      return 'An out-of-stock product cannot accept Order Requests.';
    }

    return null;
  };

  const uploadReplacementImage = async () => {
    if (!imageFile) {
      return {
        imageUrl: form.imageUrl.trim() || null,
        uploadedFileName: null as string | null,
      };
    }

    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Please select an image file.');
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image must be under 5 MB.');
    }

    const extension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;

    return {
      imageUrl,
      uploadedFileName: fileName,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');
    setShowSuccessView(false);

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    let uploadedFileName: string | null = null;

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      const token = sessionData.session?.access_token;

      if (sessionError || !token) {
        throw new Error('Please log in again.');
      }

      const uploadedImage = await uploadReplacementImage();
      uploadedFileName = uploadedImage.uploadedFileName;

      const response = await fetch(`/api/shop-owner/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          price: Number(form.price),
          salePrice: form.salePrice.trim()
            ? Number(form.salePrice)
            : null,
          description: form.description.trim(),
          imageUrl: uploadedImage.imageUrl,
          acceptsOrderRequests: form.acceptsOrderRequests,
          stockStatus: form.stockStatus,
          quantityAvailable: form.quantityAvailable.trim()
            ? Number(form.quantityAvailable)
            : null,
          pickupAvailable: form.pickupAvailable,
          localDeliveryAvailable: form.localDeliveryAvailable,
          shippingAvailable: form.shippingAvailable,
          fulfillmentNotes: form.fulfillmentNotes.trim() || null,
          maximumRequestQuantity: form.maximumRequestQuantity.trim()
            ? Number(form.maximumRequestQuantity)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (uploadedFileName) {
          await supabase.storage.from('products').remove([uploadedFileName]);
        }

        throw new Error(result?.error || 'Unable to update product.');
      }

      setForm((current) => ({
        ...current,
        imageUrl: uploadedImage.imageUrl || '',
      }));

      setOriginalImageUrl(uploadedImage.imageUrl || '');
      setImageFile(null);
      setSuccessMessage('Product updated successfully.');
      setShowSuccessView(true);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update product.';

      setErrorMessage(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading product editor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/shop-owner/products"
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Products
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-9 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Shop Owner Products
          </p>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Edit product
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">
            Update the product information and choose whether customers can
            submit Order Requests for this item.
          </p>

          {shopName && (
            <p className="mt-4 text-sm font-semibold text-blue-100">
              Shop: {shopName}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && !showSuccessView && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
              {successMessage}
            </div>
          )}

          {showSuccessView ? (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
              <div className="text-5xl" aria-hidden="true">
                ✅
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-green-950">
                Product updated successfully
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-green-800">
                <strong>{form.name}</strong> has been updated for{' '}
                <strong>{shopName}</strong>.
              </p>

              <div className="mt-6 rounded-2xl border border-green-200 bg-white p-5 text-left">
                <p className="text-sm text-slate-700">
                  <strong>Order Requests:</strong>{' '}
                  {form.acceptsOrderRequests ? 'Enabled' : 'Disabled'}
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  <strong>Stock status:</strong>{' '}
                  {STOCK_STATUS_OPTIONS.find(
                    (option) => option.value === form.stockStatus,
                  )?.label || form.stockStatus}
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  <strong>Fulfillment:</strong>{' '}
                  {[
                    form.pickupAvailable ? 'Pickup' : null,
                    form.localDeliveryAvailable ? 'Local delivery' : null,
                    form.shippingAvailable ? 'Shipping' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None selected'}
                </p>

                {form.maximumRequestQuantity && (
                  <p className="mt-2 text-sm text-slate-700">
                    <strong>Maximum per request:</strong>{' '}
                    {form.maximumRequestQuantity}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/shop-owner/products"
                  className="rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
                >
                  Back to Products
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessView(false);
                    setSuccessMessage('');
                  }}
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit Again
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <div className="mb-5">
                <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                  Product Information
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                  Basic product details
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm('name', event.target.value)
                    }
                    disabled={saving}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Regular Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateForm('price', event.target.value)
                      }
                      disabled={saving}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Sale Price optional
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.salePrice}
                      onChange={(event) =>
                        updateForm('salePrice', event.target.value)
                      }
                      disabled={saving}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      updateForm('description', event.target.value)
                    }
                    disabled={saving}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Product Image
                  </label>

                  {form.imageUrl ? (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <Image
                        src={form.imageUrl}
                        alt={form.name || 'Product image'}
                        width={1200}
                        height={700}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      No product image added.
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                    disabled={saving}
                    className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Choose a new image only when you want to replace the current
                    one. Maximum size: 5 MB.
                  </p>

                  {imageFile && (
                    <p className="mt-2 text-sm font-semibold text-blue-700">
                      New image selected: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <div className="mb-5">
                <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                  Marketplace Settings
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                  Order Request availability
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These settings work together with the shop-level Order
                  Settings. A customer can request this product only when both
                  the shop and product permit it.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="font-bold text-green-950">
                        Accept Order Requests
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-green-800">
                        Allow customers to submit a request for this product.
                        Payment is arranged directly with the shop during
                        Marketplace Phase 1.
                      </p>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={form.acceptsOrderRequests}
                        onChange={(event) =>
                          updateForm(
                            'acceptsOrderRequests',
                            event.target.checked,
                          )
                        }
                        disabled={saving}
                        className="peer sr-only"
                      />

                      <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-green-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-green-900">
                    Current status:{' '}
                    {form.acceptsOrderRequests
                      ? 'Enabled for this product'
                      : 'Disabled for this product'}
                  </p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-700">
                    Stock Status
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {STOCK_STATUS_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          form.stockStatus === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="stockStatus"
                            value={option.value}
                            checked={form.stockStatus === option.value}
                            onChange={() =>
                              updateForm('stockStatus', option.value)
                            }
                            disabled={saving}
                            className="mt-1 h-4 w-4"
                          />

                          <div>
                            <p className="font-bold text-slate-950">
                              {option.label}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Quantity Available optional
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.quantityAvailable}
                      onChange={(event) =>
                        updateForm(
                          'quantityAvailable',
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      placeholder="Leave blank if not tracked"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Leave blank when inventory is not tracked by quantity.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Maximum Quantity Per Request optional
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.maximumRequestQuantity}
                      onChange={(event) =>
                        updateForm(
                          'maximumRequestQuantity',
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      placeholder="Example: 5"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700">
                    Product Fulfillment Options
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Select the methods that are available for this specific
                    product.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <label className="cursor-pointer rounded-2xl border border-slate-200 p-4 hover:border-blue-300">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.pickupAvailable}
                          onChange={(event) =>
                            updateForm(
                              'pickupAvailable',
                              event.target.checked,
                            )
                          }
                          disabled={saving}
                          className="h-5 w-5 rounded"
                        />

                        <span className="font-bold text-slate-950">
                          🛍️ Pickup
                        </span>
                      </div>
                    </label>

                    <label className="cursor-pointer rounded-2xl border border-slate-200 p-4 hover:border-blue-300">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.localDeliveryAvailable}
                          onChange={(event) =>
                            updateForm(
                              'localDeliveryAvailable',
                              event.target.checked,
                            )
                          }
                          disabled={saving}
                          className="h-5 w-5 rounded"
                        />

                        <span className="font-bold text-slate-950">
                          🚗 Local Delivery
                        </span>
                      </div>
                    </label>

                    <label className="cursor-pointer rounded-2xl border border-slate-200 p-4 hover:border-blue-300">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.shippingAvailable}
                          onChange={(event) =>
                            updateForm(
                              'shippingAvailable',
                              event.target.checked,
                            )
                          }
                          disabled={saving}
                          className="h-5 w-5 rounded"
                        />

                        <span className="font-bold text-slate-950">
                          📦 Shipping
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Fulfillment Notes optional
                  </label>

                  <textarea
                    rows={4}
                    value={form.fulfillmentNotes}
                    onChange={(event) =>
                      updateForm(
                        'fulfillmentNotes',
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    placeholder="Example: Pickup is usually ready within 30 minutes. Local delivery is available within 8 km."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/shop-owner/products"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving Changes...' : 'Save Product Changes'}
              </button>
            </div>
          </form>
          )}
        </section>
      </div>
    </main>
  );
}