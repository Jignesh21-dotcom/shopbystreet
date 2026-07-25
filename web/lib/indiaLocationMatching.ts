export type StreetRecord = {
  id: string;
  name: string;
  slug: string;
};

const ROAD_WORDS: Record<string, string> = {
  rd: 'road',
  road: 'road',
  st: 'street',
  street: 'street',
  ave: 'avenue',
  av: 'avenue',
  avenue: 'avenue',
  dr: 'drive',
  drive: 'drive',
  ln: 'lane',
  lane: 'lane',
  hwy: 'highway',
  highway: 'highway',
  blvd: 'boulevard',
  boulevard: 'boulevard',
  ctr: 'centre',
  center: 'centre',
  centre: 'centre',
  mkt: 'market',
  market: 'market',
};

/**
 * Produces a comparison key so names such as "R.C. Dutt Rd" and
 * "RC Dutt Road" match the same existing browse street/area.
 */
export function normalizeIndiaLocationKey(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => ROAD_WORDS[part] || part)
    .join(' ');
}

export function findMatchingStreet(
  streets: StreetRecord[],
  requestedName: string | null | undefined,
) {
  const requestedKey = normalizeIndiaLocationKey(requestedName);
  if (!requestedKey) return null;

  return (
    streets.find(
      (street) => normalizeIndiaLocationKey(street.name) === requestedKey,
    ) || null
  );
}
