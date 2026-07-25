import type { Metadata } from 'next';
import GujaratClient from './GujaratClient';

export const metadata: Metadata = {
  title: 'Explore Gujarat | LocalStreetShop India',
  description:
    'Explore Gujarat’s founding cities, local markets, shopping areas, streets, and independent businesses with LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/countries/india/gujarat',
  },
  openGraph: {
    title: 'Explore Gujarat | LocalStreetShop India',
    description:
      'Discover Gujarat city by city, market by market, and street by street.',
    url: 'https://www.localstreetshop.com/countries/india/gujarat',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GujaratPage() {
  return <GujaratClient />;
}