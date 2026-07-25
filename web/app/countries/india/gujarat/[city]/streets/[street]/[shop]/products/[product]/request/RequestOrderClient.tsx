'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';


const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type FulfillmentMethod =
  | 'pickup'
  | 'local_delivery'
  | 'shipping';

type RequestOrderClientProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    stockStatus: string;
    fulfillmentNotes: string | null;
    maximumQuantity: number | null;
  };
  shop: {
    id: string;
    name: string;
  };
  settings: {
    availableMethods: FulfillmentMethod[];
    responseTimeMinutes: number;
    requestExpiryHours: number;
    minimumOrderAmount: number | null;
    requestInstructions: string | null;
    localDeliveryNotes: string | null;
    shippingNotes: string | null;
  };
  productsHref: string;
  shopHref: string;
};

type FormState = {
  fulfillmentMethod: FulfillmentMethod;
  quantity: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2: string;
  deliveryCity: string;
  deliveryProvince: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  customerNote: string;
};

const METHOD_DETAILS: Record<
  FulfillmentMethod,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  pickup: {
    label: 'Pickup',
    icon: '🛍️',
    description: 'Collect the order directly from the shop.',
  },
  local_delivery: {
    label: 'Local Delivery',
    icon: '🚗',
    description: 'The shop delivers within its local service area.',
  },
  shipping: {
    label: 'Shipping',
    icon: '📦',
    description: 'The shop ships the order to your address.',
  },
};

const PROVINCES = ['Gujarat'];

function formatResponseTime(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes === 60) return '1 hour';
  if (minutes < 1440 && minutes % 60 === 0) {
    return `${minutes / 60} hours`;
  }
  if (minutes === 1440) return '1 day';
  return `${minutes} minutes`;
}

function stockLabel(status: string) {
  const labels: Record<string, string> = {
    in_stock: 'In stock',
    low_stock: 'Low stock',
    made_to_order: 'Made to order',
    contact_shop: 'Contact shop',
  };

  return labels[status] || 'Available';
}

export default function RequestOrderClient({
  product,
  shop,
  settings,
  productsHref,
  shopHref,
}: RequestOrderClientProps) {
  const firstMethod = settings.availableMethods[0];

  const [form, setForm] = useState<FormState>({
    fulfillmentMethod: firstMethod,
    quantity: '1',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddressLine1: '',
    deliveryAddressLine2: '',
    deliveryCity: '',
    deliveryProvince: 'Gujarat',
    deliveryPostalCode: '',
    deliveryCountry: 'India',
    customerNote: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<{
    requestNumber: string;
    customerAccessToken?: string;
  } | null>(null);

  const quantity = Number(form.quantity) || 0;
  const estimatedTotal = useMemo(
    () => product.price * quantity,
    [product.price, quantity],
  );

  const updateForm = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (
      !settings.availableMethods.includes(
        form.fulfillmentMethod,
      )
    ) {
      return 'Choose an available fulfillment method.';
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return 'Quantity must be at least 1.';
    }

    if (
      product.maximumQuantity !== null &&
      quantity > product.maximumQuantity
    ) {
      return `The maximum quantity for this request is ${product.maximumQuantity}.`;
    }

    if (
      settings.minimumOrderAmount !== null &&
      estimatedTotal < settings.minimumOrderAmount
    ) {
      return `This shop requires a minimum request amount of ₹${settings.minimumOrderAmount.toFixed(
        2,
      )}.`;
    }

    if (!form.customerName.trim()) {
      return 'Enter your full name.';
    }

    if (!form.customerEmail.trim()) {
      return 'Enter your email address.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.customerEmail.trim())) {
      return 'Enter a valid email address.';
    }

    if (
      form.fulfillmentMethod === 'local_delivery' &&
      !form.deliveryAddressLine1.trim()
    ) {
      return 'Enter a delivery address for Local Delivery.';
    }

    if (
      (form.fulfillmentMethod === 'local_delivery' ||
        form.fulfillmentMethod === 'shipping') &&
      (
        !form.deliveryCity.trim() ||
        !form.deliveryProvince.trim() ||
        !form.deliveryPostalCode.trim()
      )
    ) {
      return 'Complete the city, state, and PIN code.';
    }

    return null;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage('');

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const needsAddress =
        form.fulfillmentMethod === 'local_delivery' ||
        form.fulfillmentMethod === 'shipping';

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      const response = await fetch('/api/order-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          productId: product.id,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail
            .trim()
            .toLowerCase(),
          customerPhone:
            form.customerPhone.trim() || null,
          quantity,
          fulfillmentMethod: form.fulfillmentMethod,
          deliveryAddressLine1: needsAddress
            ? form.deliveryAddressLine1.trim() || null
            : null,
          deliveryAddressLine2: needsAddress
            ? form.deliveryAddressLine2.trim() || null
            : null,
          deliveryCity: needsAddress
            ? form.deliveryCity.trim() || null
            : null,
          deliveryProvince: needsAddress
            ? form.deliveryProvince.trim() || null
            : null,
          deliveryPostalCode: needsAddress
            ? form.deliveryPostalCode
                .trim()
                .toUpperCase() || null
            : null,
          deliveryCountry: needsAddress
            ? form.deliveryCountry.trim() || 'India'
            : null,
          customerNote:
            form.customerNote.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Unable to submit your Order Request.',
        );
      }

      const accessToken =
        result.customerAccessToken ||
        result.customer_access_token ||
        result.request?.customer_access_token ||
        result.request?.customerAccessToken ||
        '';

      setSubmittedRequest({
        requestNumber:
          result.requestNumber ||
          result.request?.request_number ||
          'Submitted',
        customerAccessToken: accessToken || undefined,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit your Order Request.',
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-900 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-green-200 bg-white p-6 text-center shadow-sm sm:p-9">
            <div className="text-5xl" aria-hidden="true">
              ✅
            </div>

            <p className="mt-4 text-sm font-bold uppercase tracking-[0.22em] text-green-700">
              Marketplace Phase 1
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-green-950">
              Order Request sent
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-green-800">
              Your request for <strong>{product.name}</strong>{' '}
              has been sent to <strong>{shop.name}</strong>.
            </p>

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-left">
              <p className="text-sm text-slate-700">
                <strong>Request number:</strong>{' '}
                {submittedRequest.requestNumber}
              </p>

              <p className="mt-2 text-sm text-slate-700">
                <strong>Quantity:</strong> {quantity}
              </p>

              <p className="mt-2 text-sm text-slate-700">
                <strong>Fulfillment:</strong>{' '}
                {METHOD_DETAILS[form.fulfillmentMethod].label}
              </p>

              <p className="mt-2 text-sm text-slate-700">
                <strong>Estimated product total:</strong> ₹
                {estimatedTotal.toFixed(2)}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
              <h2 className="font-bold text-blue-950">
                What happens next?
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                The shop will review your request and contact you
                directly. No payment has been collected by
                LocalStreetShop.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              {submittedRequest.customerAccessToken && (
                <Link
                  href={`/order-request/${encodeURIComponent(
                    submittedRequest.requestNumber,
                  )}?token=${encodeURIComponent(
                    submittedRequest.customerAccessToken,
                  )}`}
                  className="rounded-full bg-green-600 px-7 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  Track My Request
                </Link>
              )}

              {!submittedRequest.customerAccessToken && (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Tracking link is temporarily unavailable for this request because no access token was returned.
                </p>
              )}

              <Link
                href={productsHref}
                className="rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Browse More Products
              </Link>

              <Link
                href={shopHref}
                className="rounded-full border border-slate-300 bg-white px-7 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const selectedMethod =
    METHOD_DETAILS[form.fulfillmentMethod];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={productsHref}
          className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          ← Back to Products
        </Link>

        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="grid md:grid-cols-[280px_1fr]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-64 w-full object-cover md:h-full"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center bg-blue-50 text-sm font-bold text-blue-700">
                No product image
              </div>
            )}

            <div className="p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
                Marketplace Phase 1
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Request Order
              </h1>

              <p className="mt-5 text-sm font-bold text-slate-500">
                {shop.name}
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                {product.name}
              </h2>

              <p className="mt-2 text-xl font-extrabold text-blue-700">
                ₹{product.price.toFixed(2)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  {stockLabel(product.stockStatus)}
                </span>

                {settings.availableMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800"
                  >
                    {METHOD_DETAILS[method].label}
                  </span>
                ))}
              </div>

              {product.description && (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-amber-950">
              Before you submit
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              This is an Order Request, not an online purchase.
              The shop will confirm availability and arrange payment
              directly with you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h2 className="text-xl font-extrabold text-slate-950">
                Fulfillment Method
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Choose how you would like to receive the product.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {settings.availableMethods.map((method) => {
                  const detail = METHOD_DETAILS[method];

                  return (
                    <label
                      key={method}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        form.fulfillmentMethod === method
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="fulfillmentMethod"
                          value={method}
                          checked={
                            form.fulfillmentMethod === method
                          }
                          onChange={() =>
                            updateForm(
                              'fulfillmentMethod',
                              method,
                            )
                          }
                          disabled={submitting}
                          className="mt-1 h-4 w-4"
                        />

                        <div>
                          <p className="font-bold text-slate-950">
                            {detail.icon} {detail.label}
                          </p>

                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {detail.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {form.fulfillmentMethod ===
                'local_delivery' &&
                settings.localDeliveryNotes && (
                  <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    {settings.localDeliveryNotes}
                  </p>
                )}

              {form.fulfillmentMethod === 'shipping' &&
                settings.shippingNotes && (
                  <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    {settings.shippingNotes}
                  </p>
                )}
            </section>

            <section className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-extrabold text-slate-950">
                Order Details
              </h2>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      product.maximumQuantity ?? undefined
                    }
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      updateForm(
                        'quantity',
                        event.target.value,
                      )
                    }
                    disabled={submitting}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  {product.maximumQuantity !== null && (
                    <p className="mt-2 text-xs text-slate-500">
                      Maximum per request:{' '}
                      {product.maximumQuantity}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-900">
                    Estimated product total
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-blue-700">
                    ₹{estimatedTotal.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    Final price and payment are confirmed by the
                    shop.
                  </p>
                </div>
              </div>

              {settings.minimumOrderAmount !== null && (
                <p className="mt-4 text-sm text-slate-600">
                  Minimum request amount: ₹
                  {settings.minimumOrderAmount.toFixed(2)}
                </p>
              )}
            </section>

            <section className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-extrabold text-slate-950">
                Your Information
              </h2>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(event) =>
                      updateForm(
                        'customerName',
                        event.target.value,
                      )
                    }
                    disabled={submitting}
                    required
                    autoComplete="name"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) =>
                      updateForm(
                        'customerEmail',
                        event.target.value,
                      )
                    }
                    disabled={submitting}
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone optional
                  </label>

                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(event) =>
                      updateForm(
                        'customerPhone',
                        event.target.value,
                      )
                    }
                    disabled={submitting}
                    autoComplete="tel"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {(form.fulfillmentMethod === 'local_delivery' ||
              form.fulfillmentMethod === 'shipping') && (
              <section className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-extrabold text-slate-950">
                  {form.fulfillmentMethod ===
                  'local_delivery'
                    ? 'Delivery Address'
                    : 'Shipping Address'}
                </h2>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Address Line 1
                    </label>

                    <input
                      type="text"
                      value={form.deliveryAddressLine1}
                      onChange={(event) =>
                        updateForm(
                          'deliveryAddressLine1',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      required
                      autoComplete="address-line1"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Address Line 2 optional
                    </label>

                    <input
                      type="text"
                      value={form.deliveryAddressLine2}
                      onChange={(event) =>
                        updateForm(
                          'deliveryAddressLine2',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      autoComplete="address-line2"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      value={form.deliveryCity}
                      onChange={(event) =>
                        updateForm(
                          'deliveryCity',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      required
                      autoComplete="address-level2"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      State
                    </label>

                    <select
                      value={form.deliveryProvince}
                      onChange={(event) =>
                        updateForm(
                          'deliveryProvince',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      required
                      autoComplete="address-level1"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      {PROVINCES.map((province) => (
                        <option
                          key={province}
                          value={province}
                        >
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      PIN Code
                    </label>

                    <input
                      type="text"
                      value={form.deliveryPostalCode}
                      onChange={(event) =>
                        updateForm(
                          'deliveryPostalCode',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      required
                      autoComplete="postal-code"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Country
                    </label>

                    <input
                      type="text"
                      value={form.deliveryCountry}
                      onChange={(event) =>
                        updateForm(
                          'deliveryCountry',
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      required
                      autoComplete="country-name"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="border-t border-slate-200 pt-8">
              <label className="mb-2 block text-xl font-extrabold text-slate-950">
                Additional Notes optional
              </label>

              <p className="mb-3 text-sm text-slate-600">
                Share product preferences or anything the shop
                should know.
              </p>

              <textarea
                rows={5}
                value={form.customerNote}
                onChange={(event) =>
                  updateForm(
                    'customerNote',
                    event.target.value,
                  )
                }
                disabled={submitting}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </section>

            {(settings.requestInstructions ||
              product.fulfillmentNotes) && (
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="font-bold text-blue-950">
                  Shop Instructions
                </h2>

                {settings.requestInstructions && (
                  <p className="mt-2 text-sm leading-6 text-blue-800">
                    {settings.requestInstructions}
                  </p>
                )}

                {product.fulfillmentNotes && (
                  <p className="mt-2 text-sm leading-6 text-blue-800">
                    {product.fulfillmentNotes}
                  </p>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <h2 className="font-bold text-green-950">
                What to expect
              </h2>

              <div className="mt-3 space-y-2 text-sm text-green-800">
                <p>✓ No payment is collected today.</p>
                <p>
                  ✓ The shop reviews and confirms availability.
                </p>
                <p>
                  ✓ The shop contacts you directly to arrange the
                  next steps.
                </p>
                <p>
                  ✓ Requests expire after{' '}
                  {settings.requestExpiryHours} hours if they are
                  not answered.
                </p>
                <p>
                  ✓ Expected response time:{' '}
                  {formatResponseTime(
                    settings.responseTimeMinutes,
                  )}.
                </p>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href={productsHref}
                className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-green-600 px-7 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Submitting Request...'
                  : `Submit ${selectedMethod.label} Request`}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}