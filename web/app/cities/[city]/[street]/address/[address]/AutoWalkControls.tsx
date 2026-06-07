'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type AutoWalkControlsProps = {
  nextStopHref?: string | null;
  streetHref: string;
  isLastStop: boolean;
};

export default function AutoWalkControls({
  nextStopHref,
  streetHref,
  isLastStop,
}: AutoWalkControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auto = searchParams.get('auto') === '1';
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!auto || isLastStop || !nextStopHref) return;

    setSecondsLeft(5);

    const countdown = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    const timer = setTimeout(() => {
      router.push(`${nextStopHref}?auto=1`);
    }, 5000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timer);
    };
  }, [auto, isLastStop, nextStopHref, router]);

  if (isLastStop) {
    return (
      <Link
        href={streetHref}
        className="inline-block bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
      >
        Walk complete — explore full street →
      </Link>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {auto ? (
        <>
          <Link
            href={nextStopHref || '#'}
            className="inline-block bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-center"
          >
            Auto walking... next stop in {secondsLeft}s
          </Link>

          <Link
            href={nextStopHref || '#'}
            className="inline-block bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition text-center"
          >
            Stop Auto Walk
          </Link>
        </>
      ) : (
        <Link
          href={`${nextStopHref}?auto=1`}
          className="inline-block bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-center"
        >
          ▶ Start Auto Walk
        </Link>
      )}
    </div>
  );
}