import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'LocalStreetShop | The Digital Main Street of Canada',
  description:
    'Discover local shops, support small businesses, and explore Canadian streets online with LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/',
  },
  openGraph: {
    title: 'LocalStreetShop | The Digital Main Street of Canada',
    description:
      'Discover local shops, support small businesses, and explore Canadian streets online with LocalStreetShop.',
    url: 'https://www.localstreetshop.com/',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeClient />;
}