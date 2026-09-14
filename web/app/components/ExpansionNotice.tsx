import Link from 'next/link';

export default function ExpansionNotice() {
  return (
    <div className="w-full rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 px-6 py-4 text-center text-base font-bold text-yellow-950 shadow-lg sm:text-lg">
      🌎 LocalStreetShop is growing across Canada, India, and the United States.{' '}
      <Link href="/live-cities" className="underline hover:text-yellow-800">
        Explore live cities
      </Link>
      {' '}or{' '}
      <Link href="/shop-owner/businesses/new" className="underline hover:text-yellow-800">
        add your business
      </Link>
      .
    </div>
  );
}
