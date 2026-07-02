'use client';

import { useState } from 'react';
import Link from 'next/link';

type Stop = {
  address: string;
  href: string;
};

type StreetStopsToggleProps = {
  stops: Stop[];
};

export default function StreetStopsToggle({ stops }: StreetStopsToggleProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleStops = expanded ? stops : stops.slice(0, 12);

  if (stops.length === 0) return null;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        {visibleStops.map((stop, index) => (
          <Link
            key={`${stop.address}-${index}`}
            href={stop.href}
            prefetch={false}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
          >
            Stop {index + 1}: {stop.address}
          </Link>
        ))}
      </div>

      {stops.length > 12 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-5 rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          {expanded ? 'Show fewer stops' : `Show all ${stops.length} stops`}
        </button>
      )}
    </>
  );
}