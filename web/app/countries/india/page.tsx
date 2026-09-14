import type { Metadata } from 'next';
import IndiaClient from './IndiaClient';

export const metadata: Metadata = {
  title: 'Explore India | LocalStreetShop',
  description:
    'Explore local streets, markets, shops, and products across India. LocalStreetShop began its India rollout in Gujarat and now supports businesses across all states and Union Territories.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/countries/india',
  },
  openGraph: {
    title: 'Explore India | LocalStreetShop',
    description:
      'Discover local shops and shopping streets as LocalStreetShop expands across India, with Gujarat as the founding launch state.',
    url: 'https://www.localstreetshop.com/countries/india',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function IndiaPage() {
  return <IndiaClient />;
}