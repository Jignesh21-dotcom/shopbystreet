import Link from 'next/link';

export default function StreetAmbassadorPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 text-gray-800">
      <section className="text-center mb-12">
        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
          LocalStreetShop Community Program
        </p>

        <h1 className="text-4xl font-bold mt-3 mb-4">
          Become a LocalStreetShop Ambassador
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Help local businesses get discovered online while building real-world
          communication, marketing, and community experience.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            href="/contact-us"
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
          >
            Apply Now
          </Link>

          <Link
            href="/shop-owner"
            className="border border-green-700 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            For Shop Owners
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-14">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Gain Experience</h2>
          <p className="text-gray-600">
            Build communication, marketing, sales, and community outreach skills
            by connecting with real local businesses.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Support Local Shops</h2>
          <p className="text-gray-600">
            Help shop owners claim their listings, update their information, and
            understand how LocalStreetShop works.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Earn Recognition</h2>
          <p className="text-gray-600">
            Ambassadors may receive certificates, reference letters, and future
            reward opportunities based on participation and results.
          </p>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">What You’ll Do</h2>

        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Represent LocalStreetShop in a professional and respectful way.</li>
          <li>Visit assigned local streets and introduce LocalStreetShop to business owners.</li>
          <li>Help businesses understand how to claim their free listing.</li>
          <li>Collect basic interest from shop owners who want to learn more.</li>
          <li>Share feedback with the LocalStreetShop team.</li>
        </ul>
      </section>

      <section className="bg-green-50 border border-green-100 rounded-xl p-6 mb-14">
        <h2 className="text-2xl font-bold mb-4">Important Safety Guidelines</h2>

        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Ambassadors should visit businesses only during normal business hours.</li>
          <li>Do not enter private or restricted areas of any business.</li>
          <li>Do not pressure any business owner to sign up or buy anything.</li>
          <li>LocalStreetShop handles final follow-up for paid services.</li>
          <li>Parent or guardian consent may be required for students under the age of majority.</li>
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Recognition Levels</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg">Bronze</h3>
            <p className="text-sm text-gray-600 mt-2">
              Complete your first assigned street outreach tasks.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg">Silver</h3>
            <p className="text-sm text-gray-600 mt-2">
              Help more businesses learn about LocalStreetShop.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg">Gold</h3>
            <p className="text-sm text-gray-600 mt-2">
              Show strong consistency, professionalism, and community impact.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg">Street Captain</h3>
            <p className="text-sm text-gray-600 mt-2">
              Become a trusted ambassador for a specific local street.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Who Can Apply?</h2>

        <p className="text-gray-700 mb-3">
          This program is designed for students, young adults, and community-minded
          individuals who want practical experience while supporting local businesses.
        </p>

        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>High school students</li>
          <li>College and university students</li>
          <li>Newcomers looking for Canadian community experience</li>
          <li>Anyone interested in business, marketing, technology, or local shopping</li>
        </ul>
      </section>

      <section className="bg-gray-900 text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Ready to become a LocalStreetShop Ambassador?
        </h2>

        <p className="text-gray-300 mb-6">
          Contact us and mention “Street Ambassador Program” in your message.
        </p>

        <Link
          href="/contact-us"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Apply Through Contact Form
        </Link>
      </section>
    </main>
  );
}