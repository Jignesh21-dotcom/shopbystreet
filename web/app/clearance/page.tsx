import Link from "next/link";
import products from "@/data/products.json";
import SEO from "@/app/components/SEO";

// Define the product type
type Product = {
  name: string;
  price: string;
  shopSlug: string;
  discount?: number;
};

export default function ClearancePage() {
  const discountedProducts = (products as Product[]).filter(
    (product) => product.discount && product.discount > 0
  );

  return (
    <>
      <SEO
        title="Clearance Sale - Big Discounts | Shop Street"
        description="Explore massive discounts on local products. Limited-time deals from neighborhood shops near you!"
        url="https://www.localstreetshop.com/clearance"
      />
      <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col items-center">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="self-start mb-6 text-yellow-700 hover:text-yellow-900 hover:underline"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl font-bold text-yellow-800 mb-10">
          🛒 Clearance Sale - Big Discounts!
        </h1>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {discountedProducts.length > 0 ? (
            discountedProducts.map((product) => (
              <div
                key={product.name}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-2xl font-semibold text-yellow-700 mb-2">{product.name}</h2>
                <p className="text-xl font-bold text-yellow-600 mb-2">{product.price}</p>
                <span className="inline-block bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {product.discount}% OFF
                </span>
              </div>
            ))
          ) : (
            <p className="text-yellow-700 text-xl">No discounted products available right now.</p>
          )}
        </div>
      </div>
    </>
  );
}
