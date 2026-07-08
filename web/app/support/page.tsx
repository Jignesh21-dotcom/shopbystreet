import Link from "next/link";

export const metadata = {
  title: "Support the Project | LocalStreetShop",
  description:
    "Support LocalStreetShop, Canada's Digital Main Street. Help us grow by sharing the platform, introducing business owners, becoming a Community Partner, or supporting the project financially.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-700">
            Support the Project
          </p>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            Help Build Canada&apos;s Digital Main Street
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            LocalStreetShop is an independent Canadian project helping people
            discover and support local businesses by exploring real streets,
            real communities, and real neighbourhoods across Canada.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-slate-900">
            Why LocalStreetShop Exists
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Many local businesses are part of the heart of our communities, but
            they are not always easy to discover online. LocalStreetShop was
            created to give every local business a better chance to be seen,
            supported, and remembered.
          </p>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Instead of only searching by business name or category,
            LocalStreetShop lets people explore Canada the way communities are
            actually built — by province, city, street, address, and shop.
          </p>
        </div>
      </section>

      {/* Ways to help */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900">
              Ways You Can Help
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Financial support is appreciated, but it is not the only way to
              help. Every share, introduction, and conversation helps this
              mission grow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">🤝</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Introduce a Business Owner
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Know a local shop owner? Invite them to claim their free
                business profile.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">📣</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Share LocalStreetShop
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Tell friends, family, local businesses, or community groups
                about Canada&apos;s Digital Main Street.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">🌟</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Become a Community Partner
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Help introduce LocalStreetShop to business owners and
                communities you already know.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">❤️</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Support Financially
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Contributions help with development, hosting, mapping, and
                expanding the platform across Canada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-blue-700 p-10 text-center text-white shadow-xl md:p-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-100">
            Financial Support
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Support Canada&apos;s Digital Main Street
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-blue-50">
            Every contribution — big or small — helps us continue building
            LocalStreetShop, improve the platform, keep business profiles free
            to claim, and help more local businesses get discovered.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-blue-50">
            Whether it&apos;s $1, $5, $50, or any amount you choose, your
            support helps move the mission forward.
          </p>

          <form
            action="/api/donations/checkout"
            method="POST"
            className="mx-auto mt-8 max-w-md rounded-2xl bg-white p-5 text-left shadow-lg"
          >
            <label
              htmlFor="amount"
              className="block text-sm font-bold text-slate-700"
            >
              Choose your support amount
            </label>

            <div className="mt-3 flex items-center rounded-full border border-slate-300 bg-white px-4 py-3">
              <span className="mr-2 font-bold text-slate-700">$</span>

              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="1"
                required
                placeholder="Enter amount"
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />

              <span className="ml-2 text-sm font-semibold text-slate-500">
                CAD
              </span>
            </div>

            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              ❤️ Support the Project
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              You&apos;ll be redirected to Stripe to complete your secure
              contribution.
            </p>
          </form>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/community-partners"
              className="rounded-full bg-white px-7 py-3 font-bold text-blue-700 hover:bg-blue-50"
            >
              Become a Community Partner
            </Link>

            <Link
              href="/contact-us"
              className="rounded-full border border-white px-7 py-3 font-bold text-white hover:bg-white hover:text-blue-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}