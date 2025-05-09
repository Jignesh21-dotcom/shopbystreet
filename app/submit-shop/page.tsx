type Street = {
  name: string;
  slug: string;
  citySlug: string;
  provinceSlug?: string; // Optional provinceSlug
};

export default function SubmitShopPage() {
  const streets: Street[] = [
    { name: "Main Street", slug: "main-street", citySlug: "city-1", provinceSlug: "province-1" },
    { name: "Second Street", slug: "second-street", citySlug: "city-2" },
    { name: "Third Street", slug: "third-street", citySlug: "city-3", provinceSlug: "province-2" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Submit Your Shop</h1>
      <ul>
        {streets.map((street) => (
          <li key={street.slug}>
            {street.name} - {street.citySlug}
            {street.provinceSlug && `, ${street.provinceSlug}`}
          </li>
        ))}
      </ul>
    </div>
  );
}