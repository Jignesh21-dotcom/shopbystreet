import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add or Claim a Business | LocalStreetShop',
  description: 'Choose a country and add or claim your local business.',
  robots: { index: false, follow: false },
};

const countryOptions = [
  {
    name: 'Canada',
    flag: '🇨🇦',
    description: 'Add a new Canadian shop or claim a business already listed.',
    addHref: '/shop-owner/shops/add',
    claimHref: '/shop-owner/claim',
    accent: 'border-blue-200 bg-blue-50',
  },
  {
    name: 'India',
    flag: '🇮🇳',
    description: 'Submit an Indian business with detailed street, complex, and landmark information.',
    addHref: '/countries/india/add-business',
    claimHref: '/shop-owner/claim',
    accent: 'border-orange-200 bg-orange-50',
  },
];

export default function ChooseBusinessCountryPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/shop-owner/dashboard" className="text-sm font-bold text-blue-700 hover:text-blue-900">
          ← Back to Dashboard
        </Link>

        <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-6 py-10 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">Global Business Access</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Where is your business located?</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-blue-50 sm:text-lg">
            Your LocalStreetShop account works across every supported country. Choose the country, then add a new business or claim an existing listing.
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {countryOptions.map((country) => (
            <section key={country.name} className={`rounded-[2rem] border p-6 shadow-sm ${country.accent}`}>
              <div className="text-5xl" aria-hidden="true">{country.flag}</div>
              <h2 className="mt-4 text-3xl font-black text-slate-950">{country.name}</h2>
              <p className="mt-3 min-h-14 leading-7 text-slate-600">{country.description}</p>

              <div className="mt-6 grid gap-3">
                <Link href={country.addHref} className="rounded-full bg-green-600 px-6 py-3 text-center font-bold text-white transition hover:bg-green-700">
                  + Add New Business
                </Link>
                <Link href={country.claimHref} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-800 transition hover:bg-slate-100">
                  Claim Existing Business
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
