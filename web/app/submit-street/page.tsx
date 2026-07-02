import type { Metadata } from 'next';
import SubmitStreetClient from './SubmitStreetClient';

export const metadata: Metadata = {
  title: 'Suggest a Street | LocalStreetShop',
  description:
    'Suggest a street for LocalStreetShop and help us expand local business discovery in your city.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/submit-street',
  },
  openGraph: {
    title: 'Suggest a Street | LocalStreetShop',
    description:
      'Suggest a street for LocalStreetShop and help us expand local business discovery in your city.',
    url: 'https://www.localstreetshop.com/submit-street',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function SubmitStreetPage() {
  return <SubmitStreetClient />;
}