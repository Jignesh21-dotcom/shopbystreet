import Link from 'next/link';

export default function ExpansionNotice() {
  return (
    <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-700">
        🇨🇦 LocalStreetShop is expanding across Canada.{' '}
        <Link
          href="/live-cities?country=canada"
          className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
        >
          Browse live cities
        </Link>{' '}
        and discover local businesses near you.
      </p>
    </div>
  );
}