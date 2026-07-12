import { NextResponse } from 'next/server';

const nodemailer = require('nodemailer');

const MAX_REQUEST_BYTES = 30_000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 40;
const MAX_SUBJECT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5_000;

const ALLOWED_SUBJECTS = new Set([
  'General Inquiry',
  'Shop Listing Question',
  'Shop Claim Question',
  'Product Upload Question',
  'Partnership or Ambassador Question',
  'Report Incorrect Information',
  'Technical Support',
]);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
  fileUrl?: unknown;
  website?: unknown; // Honeypot field
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const isValidEmail = (email: string) => {
  if (
    !email ||
    email.length > MAX_EMAIL_LENGTH ||
    email.includes('\r') ||
    email.includes('\n')
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidContactFileUrl = (value: string) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) return false;

    const expectedOrigin = new URL(supabaseUrl).origin;
    const expectedPath = '/storage/v1/object/public/contact-uploads/contact-files/';

    return (
      url.protocol === 'https:' &&
      url.origin === expectedOrigin &&
      url.pathname.startsWith(expectedPath) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported request format.' },
        { status: 415 }
      );
    }

    const contentLength = Number(req.headers.get('content-length') || 0);

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_REQUEST_BYTES
    ) {
      return NextResponse.json(
        { error: 'Request is too large.' },
        { status: 413 }
      );
    }

    const body = (await req.json()) as ContactPayload;

    // Honeypot. Real visitors should never fill this field.
    const honeypot = getString(body.website);

    if (honeypot) {
      // Return success so bots do not learn that they were detected.
      return NextResponse.json({ success: true });
    }

    const name = getString(body.name);
    const email = getString(body.email).toLowerCase();
    const phone = getString(body.phone);
    const requestedSubject = getString(body.subject);
    const message = getString(body.message);
    const fileUrl = getString(body.fileUrl);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: 'Name is too long.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (phone.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        { error: 'Phone number is too long.' },
        { status: 400 }
      );
    }

    if (requestedSubject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { error: 'Subject is too long.' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    if (!isValidContactFileUrl(fileUrl)) {
      return NextResponse.json(
        { error: 'Invalid attachment URL.' },
        { status: 400 }
      );
    }

    const subject = ALLOWED_SUBJECTS.has(requestedSubject)
      ? requestedSubject
      : 'General Inquiry';

    if (
      !process.env.CONTACT_SMTP_USER ||
      !process.env.CONTACT_SMTP_PASS
    ) {
      console.error('Missing contact SMTP environment variables.');

      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Not provided');
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br />');
    const safeFileUrl = fileUrl ? escapeHtml(fileUrl) : null;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.CONTACT_SMTP_USER,
        pass: process.env.CONTACT_SMTP_PASS,
      },
    });

    const adminMailResult = await transporter.sendMail({
      from: `"LocalStreetShop Support" <${process.env.CONTACT_SMTP_USER}>`,
      to: 'contact@localstreetshop.com',
      replyTo: email,
      subject: `New Contact Request: ${subject}`,
      text: [
        'New Contact Request',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
        fileUrl ? `\nAttachment: ${fileUrl}` : '',
      ].join('\n'),
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>

        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>

        ${
          safeFileUrl
            ? `
              <p>
                <strong>Attachment:</strong>
                <a
                  href="${safeFileUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View uploaded file
                </a>
              </p>
            `
            : ''
        }
      `,
    });

    if (!adminMailResult?.messageId) {
      throw new Error('Administrator notification was not accepted.');
    }

    // The main request has succeeded at this point.
    // A confirmation-email failure should not tell the visitor that the
    // original submission failed.
    try {
      await transporter.sendMail({
        from: `"LocalStreetShop Support" <${process.env.CONTACT_SMTP_USER}>`,
        to: email,
        replyTo: 'support@localstreetshop.com',
        subject: 'We received your message — LocalStreetShop',
        text: [
          `Hi ${name},`,
          '',
          'We received your message and will get back to you as soon as possible.',
          '',
          'Your message:',
          message,
          '',
          'Thank you,',
          'The LocalStreetShop Team',
        ].join('\n'),
        html: `
          <h2>Thanks for contacting LocalStreetShop</h2>

          <p>Hi ${safeName},</p>

          <p>
            We received your message and will get back to you as soon as possible.
          </p>

          <p><strong>Your message:</strong></p>
          <p>${safeMessage}</p>

          <p>
            If you need to add anything else, reply to this email or contact
            support@localstreetshop.com.
          </p>

          <p>
            Thank you,<br />
            <strong>The LocalStreetShop Team</strong>
          </p>
        `,
      });
    } catch (confirmationError) {
      console.error(
        'Contact confirmation email failed:',
        confirmationError
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact email error:', error);

    return NextResponse.json(
      { error: 'Unable to send contact request.' },
      { status: 500 }
    );
  }
}