import Link from "next/link";

export const metadata = {
  title: "Thank You | LocalStreetShop",
  description:
    "Thank you for supporting LocalStreetShop and helping build Canada's Digital Main Street.",
};

export default function SupportThankYouPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-24">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl md:p-16">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
          ❤️
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-blue-700">
          Thank You
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
          Thank You for Supporting LocalStreetShop
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Your support helps us continue building Canada&apos;s Digital Main
          Street — a community-first platform helping people discover and
          support local businesses across Canada.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Every contribution helps us improve the platform, expand into more
          communities, and keep business profiles free to claim.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Back to Home
          </Link>

          <Link
            href="/community-partners"
            className="rounded-full border border-blue-700 px-7 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Become a Community Partner
          </Link>
        </div>

        <p className="mt-10 text-sm leading-6 text-slate-500">
          Building Canada&apos;s Digital Main Street — one street, one shop, one
          community at a time.
        </p>
      </section>
    </main>
  );
}