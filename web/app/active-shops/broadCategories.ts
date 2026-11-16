/** Display-only broad category inference. Never overwrites the merchant's saved category. */
export const BROAD_CATEGORIES = [
  'Shopping & Retail', 'Food & Dining', 'Home & Property Services',
  'Beauty & Personal Care', 'Health & Wellness', 'Automotive',
  'Pets & Animals', 'Technology & Electronics', 'Sports & Recreation',
  'Education & Training', 'Professional Services', 'Travel & Hospitality',
  'Construction & Trades', 'Arts & Entertainment', 'Other Local Businesses',
] as const;

const rules: Array<[string, RegExp]> = [
  ['Pets & Animals', /\b(pet|pets|dog|dogz|pawz|cat|groom|veterinar|animal)\b|pawz|dogz/i],
  ['Health & Wellness', /\b(dental|dentist|clinic|pharmacy|physio|chiropract|wellness|optometr|medical|health)\b/i],
  ['Food & Dining', /\b(restaurant|cafe|coffee|bakery|bistro|diner|pizza|sushi|food|catering|kitchen|bar|pub)\b/i],
  ['Beauty & Personal Care', /\b(salon|barber|spa|beauty|nail|hair|cosmetic|skincare)\b/i],
  ['Automotive', /\b(auto|automotive|mechanic|tire|tyre|car wash|detailing|vehicle|garage)\b/i],
  ['Technology & Electronics', /\b(computer|electronics|phone repair|it service|software|tech repair)\b/i],
  ['Sports & Recreation', /\b(gym|fitness|yoga|sport|martial art|recreation)\b/i],
  ['Education & Training', /\b(school|tutor|academy|training|education|lessons)\b/i],
  ['Professional Services', /\b(account|lawyer|legal|consult|insurance|real estate|bookkeep)\b/i],
  ['Travel & Hospitality', /\b(hotel|motel|travel|tour|lodging|inn|resort)\b/i],
  ['Arts & Entertainment', /\b(art studio|gallery|theatre|theater|entertainment|music studio)\b/i],
  ['Home & Property Services', /\b(roof|paint|plumb|electric|electro|voltage|landscap|cleaning|handyman|hvac|heating|renovation|flooring|property maintenance|exterior|interior design)\b/i],
  ['Construction & Trades', /\b(construction|general contractor|builder|masonry|excavat|carpentry|concrete)\b/i],
  ['Shopping & Retail', /\b(shop|store|boutique|clothing|fashion|jewel|gift|grocery|laundry|furniture|retail|party supplies|chikankari|tobacco)\b/i],
];

export function broadCategory(name: string, specificCategory?: string | null): string {
  const explicit = (specificCategory || '').trim();
  const matchedBroad = BROAD_CATEGORIES.find((category) => category.toLowerCase() === explicit.toLowerCase());
  if (matchedBroad) return matchedBroad;
  const text = `${explicit} ${name}`;
  for (const [category, pattern] of rules) if (pattern.test(text)) return category;
  return 'Other Local Businesses';
}
