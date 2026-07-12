const nodemailer = require('nodemailer');

type CustomerOrderConfirmationEmail = {
  customerName: string;
  customerEmail: string;
  requestNumber: string;
  shopName: string;
  productName: string;
  quantity: number;
  estimatedTotal: number;
  fulfillmentLabel: string;
  trackingUrl: string;
};

type ShopOwnerOrderRequestNotificationEmail = {
  ownerEmail: string;
  shopName: string;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  productName: string;
  quantity: number;
  estimatedTotal: number;
  fulfillmentLabel: string;
  customerNote?: string | null;
  dashboardUrl: string;
};

type CustomerOrderRequestStatusEmail = {
  customerName: string;
  customerEmail: string;
  requestNumber: string;
  shopName: string;
  productName: string;
  quantity: number;
  estimatedTotal: number;
  fulfillmentLabel: string;
  status: 'accepted' | 'declined';
  shopResponseMessage?: string | null;
  trackingUrl: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function createMarketplaceTransporter() {
  const smtpUser = process.env.CONTACT_SMTP_USER;
  const smtpPass = process.env.CONTACT_SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'Marketplace email SMTP environment variables are not configured.',
    );
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);
}

export async function sendCustomerOrderRequestConfirmation({
  customerName,
  customerEmail,
  requestNumber,
  shopName,
  productName,
  quantity,
  estimatedTotal,
  fulfillmentLabel,
  trackingUrl,
}: CustomerOrderConfirmationEmail) {
  const transporter = createMarketplaceTransporter();
  const smtpUser = process.env.CONTACT_SMTP_USER!;

  const safeCustomerName = escapeHtml(customerName);
  const safeRequestNumber = escapeHtml(requestNumber);
  const safeShopName = escapeHtml(shopName);
  const safeProductName = escapeHtml(productName);
  const safeFulfillmentLabel = escapeHtml(fulfillmentLabel);
  const safeTrackingUrl = escapeHtml(trackingUrl);
  const formattedTotal = formatMoney(estimatedTotal);

  const result = await transporter.sendMail({
    from: `"LocalStreetShop Marketplace" <${smtpUser}>`,
    to: customerEmail,
    replyTo: 'support@localstreetshop.com',
    subject: `Order Request ${requestNumber} received — LocalStreetShop`,
    text: [
      `Hi ${customerName},`,
      '',
      `Your Order Request has been sent to ${shopName}.`,
      '',
      `Request number: ${requestNumber}`,
      `Product: ${productName}`,
      `Quantity: ${quantity}`,
      `Estimated product total: ${formattedTotal}`,
      `Fulfillment: ${fulfillmentLabel}`,
      '',
      'No payment has been collected by LocalStreetShop.',
      'The shop will review your request and contact you directly.',
      '',
      `Track your request: ${trackingUrl}`,
      '',
      'Thank you,',
      'The LocalStreetShop Team',
    ].join('\n'),
    html: `
      <div
        style="
          margin: 0;
          padding: 32px 16px;
          background: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        "
      >
        <div
          style="
            max-width: 640px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #dbeafe;
            border-radius: 24px;
            background: #ffffff;
          "
        >
          <div
            style="
              padding: 32px;
              background: linear-gradient(135deg, #1d4ed8, #4f46e5);
              color: #ffffff;
            "
          >
            <p
              style="
                margin: 0 0 10px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #dbeafe;
              "
            >
              LocalStreetShop Marketplace
            </p>

            <h1
              style="
                margin: 0;
                font-size: 30px;
                line-height: 1.2;
              "
            >
              Order Request received
            </h1>

            <p
              style="
                margin: 12px 0 0;
                color: #eff6ff;
              "
            >
              Request ${safeRequestNumber}
            </p>
          </div>

          <div style="padding: 32px;">
            <p style="margin: 0 0 18px;">
              Hi ${safeCustomerName},
            </p>

            <p style="margin: 0 0 22px; line-height: 1.6;">
              Your Order Request has been sent to
              <strong>${safeShopName}</strong>.
            </p>

            <div
              style="
                margin-bottom: 24px;
                padding: 20px;
                border-radius: 16px;
                background: #f8fafc;
              "
            >
              <p style="margin: 0 0 10px;">
                <strong>Product:</strong> ${safeProductName}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Quantity:</strong> ${quantity}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Estimated product total:</strong>
                ${formattedTotal}
              </p>

              <p style="margin: 0;">
                <strong>Fulfillment:</strong>
                ${safeFulfillmentLabel}
              </p>
            </div>

            <div
              style="
                margin-bottom: 24px;
                padding: 18px;
                border: 1px solid #fde68a;
                border-radius: 16px;
                background: #fffbeb;
                color: #92400e;
                line-height: 1.6;
              "
            >
              This is an Order Request, not an online purchase.
              No payment has been collected by LocalStreetShop.
              The shop will review your request and contact you directly.
            </div>

            <p style="margin: 0 0 24px; text-align: center;">
              <a
                href="${safeTrackingUrl}"
                style="
                  display: inline-block;
                  border-radius: 999px;
                  background: #2563eb;
                  padding: 14px 24px;
                  color: #ffffff;
                  font-weight: 700;
                  text-decoration: none;
                "
              >
                Track My Request
              </a>
            </p>

            <p
              style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #64748b;
              "
            >
              Keep this tracking link private because it opens your
              Order Request details.
            </p>

            <p style="margin: 28px 0 0; line-height: 1.6;">
              Thank you,<br />
              <strong>The LocalStreetShop Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (!result?.messageId) {
    throw new Error(
      'Customer Order Request confirmation was not accepted.',
    );
  }

  return result;
}

export async function sendShopOwnerOrderRequestNotification({
  ownerEmail,
  shopName,
  requestNumber,
  customerName,
  customerEmail,
  customerPhone,
  productName,
  quantity,
  estimatedTotal,
  fulfillmentLabel,
  customerNote,
  dashboardUrl,
}: ShopOwnerOrderRequestNotificationEmail) {
  const transporter = createMarketplaceTransporter();
  const smtpUser = process.env.CONTACT_SMTP_USER!;

  const safeShopName = escapeHtml(shopName);
  const safeRequestNumber = escapeHtml(requestNumber);
  const safeCustomerName = escapeHtml(customerName);
  const safeCustomerEmail = escapeHtml(customerEmail);
  const safeCustomerPhone = escapeHtml(
    customerPhone || 'Not provided',
  );
  const safeProductName = escapeHtml(productName);
  const safeFulfillmentLabel = escapeHtml(fulfillmentLabel);
  const safeCustomerNote = customerNote
    ? escapeHtml(customerNote).replace(/\r?\n/g, '<br />')
    : null;
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const formattedTotal = formatMoney(estimatedTotal);

  const result = await transporter.sendMail({
    from: `"LocalStreetShop Marketplace" <${smtpUser}>`,
    to: ownerEmail,
    replyTo: customerEmail,
    subject: `New Order Request ${requestNumber} for ${shopName}`,
    text: [
      `A new Order Request was submitted for ${shopName}.`,
      '',
      `Request number: ${requestNumber}`,
      `Customer: ${customerName}`,
      `Customer email: ${customerEmail}`,
      `Customer phone: ${customerPhone || 'Not provided'}`,
      `Product: ${productName}`,
      `Quantity: ${quantity}`,
      `Estimated product total: ${formattedTotal}`,
      `Fulfillment: ${fulfillmentLabel}`,
      customerNote ? `Customer note: ${customerNote}` : '',
      '',
      `View Order Requests: ${dashboardUrl}`,
      '',
      'Please review and respond from your LocalStreetShop dashboard.',
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <div
        style="
          margin: 0;
          padding: 32px 16px;
          background: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        "
      >
        <div
          style="
            max-width: 640px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #dbeafe;
            border-radius: 24px;
            background: #ffffff;
          "
        >
          <div
            style="
              padding: 32px;
              background: linear-gradient(135deg, #1d4ed8, #4f46e5);
              color: #ffffff;
            "
          >
            <p
              style="
                margin: 0 0 10px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #dbeafe;
              "
            >
              LocalStreetShop Shop Owner
            </p>

            <h1
              style="
                margin: 0;
                font-size: 30px;
                line-height: 1.2;
              "
            >
              New Order Request
            </h1>

            <p style="margin: 12px 0 0; color: #eff6ff;">
              ${safeShopName} · ${safeRequestNumber}
            </p>
          </div>

          <div style="padding: 32px;">
            <p style="margin: 0 0 22px; line-height: 1.6;">
              A customer submitted a new Order Request for
              <strong>${safeShopName}</strong>.
            </p>

            <div
              style="
                margin-bottom: 22px;
                padding: 20px;
                border-radius: 16px;
                background: #f8fafc;
              "
            >
              <p style="margin: 0 0 10px;">
                <strong>Product:</strong> ${safeProductName}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Quantity:</strong> ${quantity}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Estimated product total:</strong>
                ${formattedTotal}
              </p>

              <p style="margin: 0;">
                <strong>Fulfillment:</strong>
                ${safeFulfillmentLabel}
              </p>
            </div>

            <div
              style="
                margin-bottom: 22px;
                padding: 20px;
                border: 1px solid #dbeafe;
                border-radius: 16px;
                background: #eff6ff;
              "
            >
              <p style="margin: 0 0 10px;">
                <strong>Customer:</strong> ${safeCustomerName}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Email:</strong> ${safeCustomerEmail}
              </p>

              <p style="margin: 0;">
                <strong>Phone:</strong> ${safeCustomerPhone}
              </p>
            </div>

            ${
              safeCustomerNote
                ? `
                  <div
                    style="
                      margin-bottom: 22px;
                      padding: 20px;
                      border: 1px solid #fde68a;
                      border-radius: 16px;
                      background: #fffbeb;
                      color: #92400e;
                    "
                  >
                    <p style="margin: 0 0 8px;">
                      <strong>Customer note</strong>
                    </p>

                    <p style="margin: 0; line-height: 1.6;">
                      ${safeCustomerNote}
                    </p>
                  </div>
                `
                : ''
            }

            <p style="margin: 0 0 24px; text-align: center;">
              <a
                href="${safeDashboardUrl}"
                style="
                  display: inline-block;
                  border-radius: 999px;
                  background: #2563eb;
                  padding: 14px 24px;
                  color: #ffffff;
                  font-weight: 700;
                  text-decoration: none;
                "
              >
                View Order Requests
              </a>
            </p>

            <p
              style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #64748b;
              "
            >
              Sign in to your LocalStreetShop shop owner account to
              accept or decline this request.
            </p>

            <p style="margin: 28px 0 0; line-height: 1.6;">
              Thank you,<br />
              <strong>The LocalStreetShop Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (!result?.messageId) {
    throw new Error(
      'Shop owner Order Request notification was not accepted.',
    );
  }

  return result;
}


export async function sendCustomerOrderRequestStatusEmail({
  customerName,
  customerEmail,
  requestNumber,
  shopName,
  productName,
  quantity,
  estimatedTotal,
  fulfillmentLabel,
  status,
  shopResponseMessage,
  trackingUrl,
}: CustomerOrderRequestStatusEmail) {
  const transporter = createMarketplaceTransporter();
  const smtpUser = process.env.CONTACT_SMTP_USER!;

  const isAccepted = status === 'accepted';
  const safeCustomerName = escapeHtml(customerName);
  const safeRequestNumber = escapeHtml(requestNumber);
  const safeShopName = escapeHtml(shopName);
  const safeProductName = escapeHtml(productName);
  const safeFulfillmentLabel = escapeHtml(fulfillmentLabel);
  const safeTrackingUrl = escapeHtml(trackingUrl);
  const safeShopResponseMessage = shopResponseMessage
    ? escapeHtml(shopResponseMessage).replace(/\r?\n/g, '<br />')
    : null;
  const formattedTotal = formatMoney(estimatedTotal);

  const heading = isAccepted
    ? 'Your Order Request was accepted'
    : 'Your Order Request was declined';

  const summary = isAccepted
    ? `${shopName} accepted your Order Request. The shop will contact you directly to arrange payment and fulfillment.`
    : `${shopName} was unable to fulfill your Order Request. No payment was collected by LocalStreetShop.`;

  const result = await transporter.sendMail({
    from: `"LocalStreetShop Marketplace" <${smtpUser}>`,
    to: customerEmail,
    replyTo: 'support@localstreetshop.com',
    subject: isAccepted
      ? `Order Request ${requestNumber} accepted — LocalStreetShop`
      : `Update for Order Request ${requestNumber} — LocalStreetShop`,
    text: [
      `Hi ${customerName},`,
      '',
      summary,
      '',
      `Request number: ${requestNumber}`,
      `Shop: ${shopName}`,
      `Product: ${productName}`,
      `Quantity: ${quantity}`,
      `Estimated product total: ${formattedTotal}`,
      `Fulfillment: ${fulfillmentLabel}`,
      shopResponseMessage
        ? `\nMessage from ${shopName}:\n${shopResponseMessage}`
        : '',
      '',
      isAccepted
        ? 'Payment and fulfillment are arranged directly with the shop.'
        : 'No payment has been collected by LocalStreetShop.',
      '',
      `Track your request: ${trackingUrl}`,
      '',
      'Thank you,',
      'The LocalStreetShop Team',
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <div
        style="
          margin: 0;
          padding: 32px 16px;
          background: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        "
      >
        <div
          style="
            max-width: 640px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #dbeafe;
            border-radius: 24px;
            background: #ffffff;
          "
        >
          <div
            style="
              padding: 32px;
              background: linear-gradient(135deg, #1d4ed8, #4f46e5);
              color: #ffffff;
            "
          >
            <p
              style="
                margin: 0 0 10px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #dbeafe;
              "
            >
              LocalStreetShop Marketplace
            </p>

            <h1
              style="
                margin: 0;
                font-size: 30px;
                line-height: 1.2;
              "
            >
              ${heading}
            </h1>

            <p style="margin: 12px 0 0; color: #eff6ff;">
              Request ${safeRequestNumber}
            </p>
          </div>

          <div style="padding: 32px;">
            <p style="margin: 0 0 18px;">
              Hi ${safeCustomerName},
            </p>

            <div
              style="
                margin-bottom: 22px;
                padding: 20px;
                border: 1px solid ${
                  isAccepted ? '#bbf7d0' : '#fecaca'
                };
                border-radius: 16px;
                background: ${
                  isAccepted ? '#f0fdf4' : '#fef2f2'
                };
                color: ${
                  isAccepted ? '#166534' : '#991b1b'
                };
                line-height: 1.6;
              "
            >
              <strong>${isAccepted ? 'Great news!' : 'Request update'}</strong>
              <br />
              ${
                isAccepted
                  ? `<strong>${safeShopName}</strong> accepted your Order Request.`
                  : `<strong>${safeShopName}</strong> was unable to fulfill your Order Request.`
              }
            </div>

            ${
              safeShopResponseMessage
                ? `
                  <div
                    style="
                      margin-bottom: 22px;
                      padding: 20px;
                      border: 1px solid #bfdbfe;
                      border-radius: 16px;
                      background: #eff6ff;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 10px;
                        color: #1d4ed8;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                      "
                    >
                      Message from ${safeShopName}
                    </p>

                    <p style="margin: 0; line-height: 1.7; color: #1e293b;">
                      ${safeShopResponseMessage}
                    </p>
                  </div>
                `
                : ''
            }

            <div
              style="
                margin-bottom: 24px;
                padding: 20px;
                border-radius: 16px;
                background: #f8fafc;
              "
            >
              <p style="margin: 0 0 10px;">
                <strong>Product:</strong> ${safeProductName}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Quantity:</strong> ${quantity}
              </p>

              <p style="margin: 0 0 10px;">
                <strong>Estimated product total:</strong>
                ${formattedTotal}
              </p>

              <p style="margin: 0;">
                <strong>Fulfillment:</strong>
                ${safeFulfillmentLabel}
              </p>
            </div>

            <div
              style="
                margin-bottom: 24px;
                padding: 18px;
                border: 1px solid #fde68a;
                border-radius: 16px;
                background: #fffbeb;
                color: #92400e;
                line-height: 1.6;
              "
            >
              ${
                isAccepted
                  ? 'Payment and fulfillment are arranged directly with the shop. LocalStreetShop has not collected payment.'
                  : 'No payment has been collected by LocalStreetShop for this request.'
              }
            </div>

            <p style="margin: 0 0 24px; text-align: center;">
              <a
                href="${safeTrackingUrl}"
                style="
                  display: inline-block;
                  border-radius: 999px;
                  background: #2563eb;
                  padding: 14px 24px;
                  color: #ffffff;
                  font-weight: 700;
                  text-decoration: none;
                "
              >
                View Request Status
              </a>
            </p>

            <p
              style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #64748b;
              "
            >
              Keep this tracking link private because it opens your
              Order Request details.
            </p>

            <p style="margin: 28px 0 0; line-height: 1.6;">
              Thank you,<br />
              <strong>The LocalStreetShop Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (!result?.messageId) {
    throw new Error(
      'Customer Order Request status email was not accepted.',
    );
  }

  return result;
}