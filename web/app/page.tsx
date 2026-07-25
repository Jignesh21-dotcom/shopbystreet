import type { Metadata } from 'next';
import HomeClientGlobal from './HomeClientGlobal';

export const metadata: Metadata = {
  title: 'LocalStreetShop | Discover Local Shops, Street by Street',
  description:
    'Explore local businesses, cities, streets, markets, and products across growing LocalStreetShop communities in Canada and India.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/',
  },
  openGraph: {
    title: 'LocalStreetShop | Discover Local Shops, Street by Street',
    description:
      'Explore local businesses, cities, streets, markets, and products across Canada and India.',
    url: 'https://www.localstreetshop.com/',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeClientGlobal />;
}
