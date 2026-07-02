import type { Metadata } from 'next';
import ShopOwnerLandingClient from '@/app/shop-owner/ShopOwnerLandingClient';

export const metadata: Metadata = {
  title: 'Shop Owner Portal | LocalStreetShop',
  description:
    'Claim your local business, manage products, add photos, and reach nearby customers across Canada with LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner',
  },
  openGraph: {
    title: 'Shop Owner Portal | LocalStreetShop',
    description:
      'Claim your local business, manage products, add photos, and reach nearby customers across Canada with LocalStreetShop.',
    url: 'https://www.localstreetshop.com/shop-owner',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function ShopOwnerPage() {
  return <ShopOwnerLandingClient />;
}