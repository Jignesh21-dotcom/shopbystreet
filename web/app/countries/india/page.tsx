import type { Metadata } from 'next';
import IndiaClient from './IndiaClient';

export const metadata: Metadata = {
  title: 'Explore India | LocalStreetShop',
  description:
    'Explore local streets, markets, shops, and products in India. LocalStreetShop is beginning its India expansion in Gujarat.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/countries/india',
  },
  openGraph: {
    title: 'Explore India | LocalStreetShop',
    description:
      'Discover local shops and shopping streets as LocalStreetShop begins expanding into Gujarat, India.',
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