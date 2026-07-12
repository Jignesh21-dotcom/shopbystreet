'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Shop = {
  id: string;
  name: string;
};

type OrderSettingsRow = {
  id: string;
  shop_id: string;
  accepts_order_requests: boolean;
  offers_pickup: boolean;
  offers_local_delivery: boolean;
  offers_shipping: boolean;
  order_email: string | null;
  order_phone: string | null;
  response_time_minutes: number;
  request_expiry_hours: number;
  minimum_order_amount: number | string | null;
  local_delivery_notes: string | null;
  shipping_notes: string | null;
  request_instructions: string | null;
  service_fee_amount: number | string;
  introductory_free_request_limit: number;
};

type FormState = {
  acceptsOrderRequests: boolean;
  offersPickup: boolean;
  offersLocalDelivery: boolean;
  offersShipping: boolean;
  orderEmail: string;
  orderPhone: string;
  responseTimeMinutes: string;
  requestExpiryHours: string;
  minimumOrderAmount: string;
  localDeliveryNotes: string;
  shippingNotes: string;
  requestInstructions: string;
};

const DEFAULT_FORM_STATE: FormState = {
  acceptsOrderRequests: false,
  offersPickup: true,
  offersLocalDelivery: false,
  offersShipping: false,
  orderEmail: '',
  orderPhone: '',
  responseTimeMinutes: '60',
  requestExpiryHours: '24',
  minimumOrderAmount: '',
  localDeliveryNotes: '',
  shippingNotes: '',
  requestInstructions: '',
};

export default function OrderSettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shop');

  const [shop, setShop] = useState<Shop | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);

  const [serviceFeeAmount, setServiceFeeAmount] = useState('2.00');
  const [introductoryFreeRequestLimit, setIntroductoryFreeRequestLimit] =
    useState(5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessView, setShowSuccessView] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowSuccessView(false);

      if (!shopId) {
        setErrorMessage(
          'No shop was selected. Return to your dashboard and choose a shop.',
        );
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError) {
        setErrorMessage(`Authentication error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        router.push('/login');
        return;
      }

      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id, name')
        .eq('id', shopId)
        .eq('owner_id', authData.user.id)
        .eq('approved', true)
        .maybeSingle();

      if (!isMounted) return;

      if (shopError) {
        setErrorMessage(`Unable to load the shop: ${shopError.message}`);
        setLoading(false);
        return;
      }

      if (!shopData) {
        setErrorMessage(
          'This shop was not found, is not approved, or does not belong to your account.',
        );
        setLoading(false);
        return;
      }

      setShop(shopData as Shop);

      const { data: settingsData, error: settingsError } = await supabase
        .from('shop_order_settings')
        .select(`
          id,
          shop_id,
          accepts_order_requests,
          offers_pickup,
          offers_local_delivery,
          offers_shipping,
          order_email,
          order_phone,
          response_time_minutes,
          request_expiry_hours,
          minimum_order_amount,
          local_delivery_notes,
          shipping_notes,
          request_instructions,
          service_fee_amount,
          introductory_free_request_limit
        `)
        .eq('shop_id', shopId)
        .maybeSingle();

      if (!isMounted) return;

      if (settingsError) {
        setErrorMessage(
          `Unable to load order settings: ${settingsError.message}`,
        );
        setLoading(false);
        return;
      }

      if (settingsData) {
        const settings = settingsData as OrderSettingsRow;

        setSettingsId(settings.id);

        setForm({
          acceptsOrderRequests: settings.accepts_order_requests,
          offersPickup: settings.offers_pickup,
          offersLocalDelivery: settings.offers_local_delivery,
          offersShipping: settings.offers_shipping,
          orderEmail: settings.order_email ?? '',
          orderPhone: settings.order_phone ?? '',
          responseTimeMinutes: String(settings.response_time_minutes),
          requestExpiryHours: String(settings.request_expiry_hours),
          minimumOrderAmount:
            settings.minimum_order_amount === null
              ? ''
              : String(settings.minimum_order_amount),
          localDeliveryNotes: settings.local_delivery_notes ?? '',
          shippingNotes: settings.shipping_notes ?? '',
          requestInstructions: settings.request_instructions ?? '',
        });

        setServiceFeeAmount(
          Number(settings.service_fee_amount).toFixed(2),
        );

        setIntroductoryFreeRequestLimit(
          settings.introductory_free_request_limit,
        );
      }

      setLoading(false);
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [router, shopId]);

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
      form.acceptsOrderRequests &&
      !form.offersPickup &&
      !form.offersLocalDelivery &&
      !form.offersShipping
    ) {
      return 'Select at least one fulfillment option before accepting order requests.';
    }

    if (
      form.acceptsOrderRequests &&
      !form.orderEmail.trim() &&
      !form.orderPhone.trim()
    ) {
      return 'Enter an order email or phone number so customers can be contacted.';
    }

    const responseTime = Number(form.responseTimeMinutes);
    const expiryHours = Number(form.requestExpiryHours);

    if (!Number.isInteger(responseTime) || responseTime <= 0) {
      return 'Response time must be greater than zero.';
    }

    if (!Number.isInteger(expiryHours) || expiryHours <= 0) {
      return 'Request expiry time must be greater than zero.';
    }

    if (form.minimumOrderAmount.trim()) {
      const minimumAmount = Number(form.minimumOrderAmount);

      if (!Number.isFinite(minimumAmount) || minimumAmount < 0) {
        return 'Minimum order amount must be zero or greater.';
      }
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopId || !shop) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSuccessView(false);

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    const payload = {
      shop_id: shopId,
      accepts_order_requests: form.acceptsOrderRequests,
      offers_pickup: form.offersPickup,
      offers_local_delivery: form.offersLocalDelivery,
      offers_shipping: form.offersShipping,
      order_email: form.orderEmail.trim() || null,
      order_phone: form.orderPhone.trim() || null,
      response_time_minutes: Number(form.responseTimeMinutes),
      request_expiry_hours: Number(form.requestExpiryHours),
      minimum_order_amount: form.minimumOrderAmount.trim()
        ? Number(form.minimumOrderAmount)
        : null,
      local_delivery_notes: form.offersLocalDelivery
        ? form.localDeliveryNotes.trim() || null
        : null,
      shipping_notes: form.offersShipping
        ? form.shippingNotes.trim() || null
        : null,
      request_instructions: form.requestInstructions.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let saveError: { message: string } | null = null;

    if (settingsId) {
      const { error } = await supabase
        .from('shop_order_settings')
        .update(payload)
        .eq('id', settingsId)
        .eq('shop_id', shopId);

      saveError = error;
    } else {
      const { data, error } = await supabase
        .from('shop_order_settings')
        .insert(payload)
        .select('id')
        .single();

      saveError = error;

      if (data?.id) {
        setSettingsId(data.id);
      }
    }

    if (saveError) {
      setErrorMessage(`Unable to save order settings: ${saveError.message}`);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSuccessMessage('Order request settings saved successfully.');
    setShowSuccessView(true);
    setSaving(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-md">
          <p className="text-gray-600">Loading order settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link
            href="/shop-owner/dashboard"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Shop Owner Dashboard
          </Link>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="mb-6 border-b border-gray-200 pb-5">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-600">
              Marketplace Phase 1
            </p>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Order Request Settings
            </h1>

            {shop && (
              <p className="mt-2 text-gray-600">
                Configure how customers can request products from{' '}
                <strong>{shop.name}</strong>.
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && !showSuccessView && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              {successMessage}
            </div>
          )}

          {!shop ? (
  <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
    <p>
      Return to your dashboard and select Order Settings for one of your
      approved shops.
    </p>

    <Link
      href="/shop-owner/dashboard"
      className="mt-4 inline-block font-semibold text-blue-700 hover:text-blue-900"
    >
      Return to dashboard
    </Link>
  </div>
) : showSuccessView ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <div className="text-4xl" aria-hidden="true">
                ✅
              </div>

              <h2 className="mt-3 text-xl font-bold text-green-900">
                Order settings saved
              </h2>

              <p className="mt-2 text-green-800">
                Your order request settings for <strong>{shop.name}</strong>{' '}
                have been updated successfully.
              </p>

              <div className="mt-5 rounded-lg border border-green-200 bg-white p-4 text-left">
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong>{' '}
                  {form.acceptsOrderRequests
                    ? 'Accepting order requests'
                    : 'Order requests disabled'}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  <strong>Fulfillment:</strong>{' '}
                  {[
                    form.offersPickup ? 'Pickup' : null,
                    form.offersLocalDelivery ? 'Local delivery' : null,
                    form.offersShipping ? 'Shipping' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None selected'}
                </p>

                {(form.orderEmail || form.orderPhone) && (
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Order contact:</strong>{' '}
                    {[form.orderEmail, form.orderPhone]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/shop-owner/dashboard"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Back to Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessView(false);
                    setSuccessMessage(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-blue-900">
                        Accept Order Requests
                      </h2>

                      <p className="mt-1 text-sm text-blue-800">
                        Customers can request products, but payment will happen
                        directly between your shop and the customer.
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
                        className="peer sr-only"
                      />

                      <span className="h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-blue-900">
                    Current status:{' '}
                    {form.acceptsOrderRequests
                      ? 'Order requests are enabled'
                      : 'Order requests are disabled'}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900">
                  Fulfillment Options
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Select every option your shop can offer.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="cursor-pointer rounded-xl border border-gray-200 p-4 transition hover:border-blue-300">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.offersPickup}
                        onChange={(event) =>
                          updateForm('offersPickup', event.target.checked)
                        }
                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      />

                      <span className="font-semibold text-gray-900">
                        🛍️ Pickup
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Customer collects the order from your shop.
                    </p>
                  </label>

                  <label className="cursor-pointer rounded-xl border border-gray-200 p-4 transition hover:border-blue-300">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.offersLocalDelivery}
                        onChange={(event) =>
                          updateForm(
                            'offersLocalDelivery',
                            event.target.checked,
                          )
                        }
                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      />

                      <span className="font-semibold text-gray-900">
                        🚗 Local Delivery
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Your shop can deliver within the local area.
                    </p>
                  </label>

                  <label className="cursor-pointer rounded-xl border border-gray-200 p-4 transition hover:border-blue-300">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.offersShipping}
                        onChange={(event) =>
                          updateForm('offersShipping', event.target.checked)
                        }
                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      />

                      <span className="font-semibold text-gray-900">
                        📦 Shipping
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Your shop can ship orders to customers.
                    </p>
                  </label>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Contact Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  This information will be used to manage accepted requests.
                </p>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="order-email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Order email
                    </label>

                    <input
                      id="order-email"
                      type="email"
                      value={form.orderEmail}
                      onChange={(event) =>
                        updateForm('orderEmail', event.target.value)
                      }
                      placeholder="orders@example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="order-phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Order phone
                    </label>

                    <input
                      id="order-phone"
                      type="tel"
                      value={form.orderPhone}
                      onChange={(event) =>
                        updateForm('orderPhone', event.target.value)
                      }
                      placeholder="519-555-0123"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900">
                  Request Timing
                </h2>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="response-time"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Expected response time
                    </label>

                    <select
                      id="response-time"
                      value={form.responseTimeMinutes}
                      onChange={(event) =>
                        updateForm(
                          'responseTimeMinutes',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="15">Within 15 minutes</option>
                      <option value="30">Within 30 minutes</option>
                      <option value="60">Within 1 hour</option>
                      <option value="120">Within 2 hours</option>
                      <option value="240">Within 4 hours</option>
                      <option value="1440">Within 1 day</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="request-expiry"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Request expires after
                    </label>

                    <select
                      id="request-expiry"
                      value={form.requestExpiryHours}
                      onChange={(event) =>
                        updateForm(
                          'requestExpiryHours',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">72 hours</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Requirements
                </h2>

                <div className="mt-4">
                  <label
                    htmlFor="minimum-order"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Minimum order amount
                  </label>

                  <div className="relative max-w-sm">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                      $
                    </span>

                    <input
                      id="minimum-order"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minimumOrderAmount}
                      onChange={(event) =>
                        updateForm(
                          'minimumOrderAmount',
                          event.target.value,
                        )
                      }
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Leave blank if your shop does not require a minimum.
                  </p>
                </div>
              </section>

              {form.offersLocalDelivery && (
                <section>
                  <label
                    htmlFor="delivery-notes"
                    className="mb-2 block text-lg font-bold text-gray-900"
                  >
                    Local Delivery Notes
                  </label>

                  <textarea
                    id="delivery-notes"
                    rows={4}
                    value={form.localDeliveryNotes}
                    onChange={(event) =>
                      updateForm(
                        'localDeliveryNotes',
                        event.target.value,
                      )
                    }
                    placeholder="Example: Delivery available within 10 km. Delivery fees may apply."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </section>
              )}

              {form.offersShipping && (
                <section>
                  <label
                    htmlFor="shipping-notes"
                    className="mb-2 block text-lg font-bold text-gray-900"
                  >
                    Shipping Notes
                  </label>

                  <textarea
                    id="shipping-notes"
                    rows={4}
                    value={form.shippingNotes}
                    onChange={(event) =>
                      updateForm('shippingNotes', event.target.value)
                    }
                    placeholder="Example: Shipping is available across Canada. Rates depend on destination."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </section>
              )}

              <section>
                <label
                  htmlFor="request-instructions"
                  className="mb-2 block text-lg font-bold text-gray-900"
                >
                  Customer Instructions
                </label>

                <p className="mb-3 text-sm text-gray-600">
                  Add information customers should know before submitting a
                  request.
                </p>

                <textarea
                  id="request-instructions"
                  rows={5}
                  value={form.requestInstructions}
                  onChange={(event) =>
                    updateForm(
                      'requestInstructions',
                      event.target.value,
                    )
                  }
                  placeholder="Example: Product availability will be confirmed after we review your request."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </section>

              <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h2 className="font-bold text-green-900">
                  Introductory Marketplace Program
                </h2>

                <p className="mt-2 text-sm text-green-800">
                  Your first{' '}
                  <strong>{introductoryFreeRequestLimit}</strong> accepted order
                  requests are free.
                </p>

                <p className="mt-2 text-sm text-green-800">
                  After the introductory period, the current service fee is{' '}
                  <strong>${serviceFeeAmount}</strong> per accepted request.
                  Declined requests are free.
                </p>

                <p className="mt-2 text-xs text-green-700">
                  Customers do not pay through LocalStreetShop during Phase 1.
                  Your shop arranges payment directly with the customer.
                </p>
              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/shop-owner/dashboard"
                  className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {saving ? 'Saving...' : 'Save Order Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}