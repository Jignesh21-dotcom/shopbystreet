import SEO from '@/app/components/SEO';

type Street = {
  name: string;
  slug: string;
  citySlug: string;
  provinceSlug?: string;
};

export default function SubmitShopPage() {
  const streets: Street[] = [
    { name: "Main Street", slug: "main-street", citySlug: "city-1", provinceSlug: "province-1" },
    { name: "Second Street", slug: "second-street", citySlug: "city-2" },
    { name: "Third Street", slug: "third-street", citySlug: "city-3", provinceSlug: "province-2" },
  ];

  return (
    <>
      <SEO
        title="Submit Your Shop | Local Street Shop"
        description="Add your local business to Local Street Shop and help customers find you online. Choose your street and start listing today!"
        url="https://www.localstreetshop.com/submit-shop"
      />

      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Submit Your Shop</h1>
        <ul className="space-y-2">
          {streets.map((street) => (
            <li key={street.slug} className="text-gray-800">
              {street.name} — {street.citySlug}
              {street.provinceSlug && `, ${street.provinceSlug}`}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
