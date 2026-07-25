export type SupportedCountrySlug = 'canada' | 'india';

export function getCurrencyConfig(countrySlug?: string | null) {
  const normalizedCountry = countrySlug?.toLowerCase().trim();

  if (normalizedCountry === 'india') {
    return {
      locale: 'en-IN',
      currency: 'INR',
      maximumFractionDigits: 2,
    } as const;
  }

  return {
    locale: 'en-CA',
    currency: 'CAD',
    maximumFractionDigits: 2,
  } as const;
}

export function formatCurrency(
  value: unknown,
  countrySlug?: string | null,
) {
  const numericValue = Number(value);
  const amount = Number.isFinite(numericValue) ? numericValue : 0;
  const config = getCurrencyConfig(countrySlug);

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(amount);
}
