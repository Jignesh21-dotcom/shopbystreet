import Link from 'next/link';

const waysToHelp = [
  {
    icon: '🤝',
    title: 'Introduce',
    description:
      'Know 1–3 local business owners? Introduce them to LocalStreetShop and we’ll take it from there.',
  },
  {
    icon: '🏪',
    title: 'Connect',
    description:
      'Let business owners know claiming their basic profile is always free, even if they already have a website.',
  },
  {
    icon: '❤️',
    title: 'Strengthen Local',
    description:
      'Every business that joins helps shoppers discover more of what is available on Canadian streets.',
  },
];

const whoFits = [
  'People who know local business owners',
  'Students and young professionals',
  'Small business supporters',
  'Community-minded individuals',
  'Entrepreneurs and creators',
  'Anyone who believes local shopping matters',
];

const supporterBenefits = [
  'Be part of LocalStreetShop from the beginning',
  'Support real businesses in your community',
  'Build communication and networking experience',
  'Receive early community recognition',
  'Get updates as the platform grows',
  'Be considered for future referral opportunities',
];

const simpleSteps = [
  {
    number: '1',
    title: 'Think of a business',
    description: 'Start with one shop owner you personally know or can warmly introduce.',
  },
  {
    number: '2',
    title: 'Share LocalStreetShop',
    description: 'Tell them LocalStreetShop helps local businesses get discovered street by street.',
  },
  {
    number: '3',
    title: 'We handle the rest',
    description: 'Once introduced, LocalStreetShop can answer questions and guide them to claim their profile.',
  },
];

const faqs = [
  {
    question: 'Is this a job or employment position?',
    answer:
      'No. The Founding Community Partners page is for people who want to support the LocalStreetShop mission by making introductions. It is not an employment position.',
  },
  {
    question: 'Do I need sales experience?',
    answer:
      'No. You do not need sales experience. A simple introduction to a business owner you know is enough.',
  },
  {
    question: 'Do I have to visit businesses in person?',
    answer:
      'No. If you already know a business owner, you can introduce them by message, email, phone, or in person.',
  },
  {
    question: 'Do I need to know many businesses?',
    answer:
      'No. Even introducing one local business can help LocalStreetShop grow and support your community.',
  },
  {
    question: 'Is claiming a business profile free?',
    answer:
      'Yes. Claiming and managing a basic business profile is always free. During Phase 1, businesses can also add photos and showcase up to 100 products for free.',
  },
  {
    question: 'Will there be rewards in the future?',
    answer:
      'As LocalStreetShop grows, early community supporters may receive recognition, referral opportunities, community awards, and future program benefits.',
  },
];

export default function FoundingCommunityPartnersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* HERO */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-green-100 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
              Founding Community Partners
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Help Build Canada&apos;s Digital Main Street
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              LocalStreetShop is growing through real community connections. If you know local
              business owners, you can help introduce them to a platform built to make Canadian
              streets easier to discover.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact-us?subject=Founding%20Community%20Partner"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
              >
                I&apos;d Like to Help
              </Link>

              <Link
                href="/business-owners"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                For Business Owners
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              {[
                ['🇨🇦', 'Built for Canada'],
                ['🏪', 'Support Local'],
                ['🤝', 'Warm Introductions'],
                ['🍁', 'Founding Supporters'],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="mt-1 block font-semibold text-slate-900">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-green-600 via-blue-600 to-indigo-700 p-6 text-white">
                <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                  <p className="text-sm font-semibold text-green-50">Community-first growth</p>
                  <h2 className="mt-2 text-2xl font-black">
                    Start with businesses you already know
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-green-50">
                    No selling. No pressure. Just meaningful introductions that help local shops get discovered.
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {simpleSteps.map((step) => (
                    <div
                      key={step.title}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-lg font-black text-green-700">
                        {step.number}
                      </div>
                      <div>
                        <p className="font-bold">{step.title}</p>
                        <p className="text-sm text-slate-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-green-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-sm font-bold text-green-700">Every introduction helps</p>
              <p className="text-xs text-slate-500">Even one business can make a difference</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Why This Matters
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Every Canadian street has businesses worth discovering.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Many amazing small businesses are still difficult to discover online. LocalStreetShop
            exists to help people explore local businesses by city, street, address, and storefront.
            Founding Community Partners help us build that vision from the beginning.
          </p>
        </div>
      </section>

      {/* HOW YOU CAN HELP */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
              How You Can Help
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Introduce. Connect. Strengthen local communities.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              You do not need to sell anything. A simple warm introduction to a business owner
              you already know can help LocalStreetShop grow.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {waysToHelp.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMPLE ASK */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              What We&apos;re Asking
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Start with 1–3 businesses you know.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              This is not about knocking on every door or trying to convince strangers. The best
              early growth comes from trusted introductions.
            </p>
          </div>

          <div className="rounded-[2rem] border border-green-100 bg-green-50 p-6">
            <div className="grid gap-3">
              {[
                'Think of a business owner you already know',
                'Share LocalStreetShop with them',
                'Mention that claiming a basic profile is always free',
                'Introduce them to us if they are interested',
                'We answer questions and handle the next steps',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  <span className="font-black text-green-600">✓</span>
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO FITS */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Who This Is For
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              People who believe local businesses deserve to be discovered.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Founding Community Partners are early supporters who want to help LocalStreetShop
              reach business owners through trust, relationships, and community connection.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {whoFits.map((person) => (
              <div key={person} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="font-black text-green-600">✓</span>
                <span className="ml-3 font-semibold text-slate-800">{person}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECOGNITION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-xl shadow-slate-200 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Early Community Supporters
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              We want to remember the people who helped from the beginning.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              As LocalStreetShop grows, Founding Community Partners may receive recognition,
              early updates, referral opportunities, and future program benefits.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supporterBenefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className="font-black text-blue-600">✓</span>
                <span className="ml-3 font-semibold text-slate-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORTANT NOTE */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
            Important
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            This is about community introductions, not employment.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The Founding Community Partners initiative is for people who want to support the
            LocalStreetShop mission by introducing local business owners they already know. It is
            not an employment position, volunteer job, or sales role.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Questions
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-slate-950">
                {faq.question}
                <span className="text-xl text-blue-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL MESSAGE */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-600 via-blue-600 to-indigo-700 p-8 text-center text-white shadow-2xl shadow-blue-600/20 sm:p-12">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
            Help Build Canada&apos;s Digital Main Street
          </span>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            Every great community starts with a few people who believe in an idea.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            LocalStreetShop is still in its early days, and we&apos;re looking for people who want
            to help shape Canada&apos;s Digital Main Street from the beginning. Whether you introduce
            one business or twenty, your support helps strengthen local communities and brings more
            independent businesses online.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact-us?subject=Founding%20Community%20Partner"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              I&apos;d Like to Help
            </Link>

            <Link
              href="/business-owners"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              For Business Owners
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}