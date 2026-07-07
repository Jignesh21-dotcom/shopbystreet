import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'LocalStreetShop | Canada’s Digital Main Street',
  description:
    'Explore Canadian streets, discover local shops, find nearby products, and support small businesses with LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/',
  },
  openGraph: {
    title: 'LocalStreetShop | Canada’s Digital Main Street',
    description:
      'Explore Canadian streets, discover local shops, find nearby products, and support small businesses with LocalStreetShop.',
    url: 'https://www.localstreetshop.com/',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeClient />;
}