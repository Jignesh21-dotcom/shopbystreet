import Link from 'next/link';

export default function IndiaProfessionalSetupPaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-green-100 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Payment Successful
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Thank you for purchasing Professional Store Setup.
        </h1>
        <p className="mt-5 leading-8 text-slate-600">
          Your ₹1,299 payment was completed securely through Stripe. The LocalStreetShop team will contact you using the email connected with your payment to begin the setup process.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/shop-owner/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            Open Shop Owner Dashboard
          </Link>
          <Link
            href="/countries/india/business-owners"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            Back to Business Owners
          </Link>
        </div>
      </div>
    </main>
  );
}
