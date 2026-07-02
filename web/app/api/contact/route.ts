import { NextResponse } from 'next/server';

const nodemailer = require('nodemailer');

type ContactPayload = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  fileUrl?: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;

    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim() || 'Not provided';
    const subject = body.subject?.trim() || 'Contact Form Message';
    const message = body.message?.trim();
    const fileUrl = body.fileUrl || null;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!process.env.CONTACT_SMTP_USER || !process.env.CONTACT_SMTP_PASS) {
      console.error('Missing contact SMTP environment variables.');
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');
    const safeFileUrl = fileUrl ? escapeHtml(fileUrl) : null;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.CONTACT_SMTP_USER,
        pass: process.env.CONTACT_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"LocalStreetShop Support" <support@localstreetshop.com>`,
      to: 'contact@localstreetshop.com',
      replyTo: email,
      subject: `New Contact Request: ${subject}`,
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
            ? `<p><strong>Attachment:</strong> <a href="${safeFileUrl}">View uploaded file</a></p>`
            : ''
        }
      `,
    });

    await transporter.sendMail({
      from: `"LocalStreetShop Support" <support@localstreetshop.com>`,
      to: email,
      replyTo: 'support@localstreetshop.com',
      subject: 'We received your message — LocalStreetShop',
      html: `
        <h2>Thanks for contacting LocalStreetShop</h2>

        <p>Hi ${safeName},</p>

        <p>
          We received your message and will get back to you as soon as possible.
        </p>

        <p><strong>Your message:</strong></p>
        <p>${safeMessage}</p>

        <p>
          If you need to add anything else, you can reply to this email or contact us at
          support@localstreetshop.com.
        </p>

        <p>
          Thank you,<br />
          <strong>The LocalStreetShop Team</strong>
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact email error:', error);

    return NextResponse.json(
      { error: 'Unable to send contact email.' },
      { status: 500 }
    );
  }
}