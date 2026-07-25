import type { Metadata } from 'next';
import AhmedabadClient from './AhmedabadClient';

export const metadata: Metadata = {
  title: 'Explore Ahmedabad | LocalStreetShop Gujarat',
  description:
    'Explore Ahmedabad’s local markets, shopping areas, streets, and independent businesses with LocalStreetShop.',
  alternates: {
    canonical:
      'https://www.localstreetshop.com/countries/india/gujarat/ahmedabad',
  },
  openGraph: {
    title: 'Explore Ahmedabad | LocalStreetShop Gujarat',
    description:
      'Discover Ahmedabad market by market, area by area, and street by street.',
    url: 'https://www.localstreetshop.com/countries/india/gujarat/ahmedabad',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AhmedabadPage() {
  return <AhmedabadClient />;
}