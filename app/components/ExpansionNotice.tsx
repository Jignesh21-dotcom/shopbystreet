import Link from 'next/link';

export default function ExpansionNotice() {
  return (
    <div className="w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 px-6 py-4 text-center text-lg font-bold shadow-lg rounded-lg animate-bounce">
      🚧 We’re expanding! Right now, we’re live with shops in{' '}
      <Link href="/cities/toronto" className="text-yellow-800 underline hover:text-yellow-900">
        <strong>Toronto</strong>
      </Link>{' '}
      only. Stay tuned for more updates!
    </div>
  );
}