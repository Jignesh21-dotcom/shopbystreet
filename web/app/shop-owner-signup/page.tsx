// app/shop-owner-signup/page.tsx
import type { Metadata } from 'next';
import SignUpClient from './SignUpClient';

export const metadata: Metadata = {
  title: 'Shop Owner Sign Up | LocalStreetShop',
  description:
    'Create your shop owner account to claim your business, manage your storefront, and add products on LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner-signup',
  },
  openGraph: {
    title: 'Shop Owner Sign Up | LocalStreetShop',
    description:
      'Create your shop owner account to claim your business, manage your storefront, and add products on LocalStreetShop.',
    url: 'https://www.localstreetshop.com/shop-owner-signup',
    siteName: 'LocalStreetShop',
    type: 'website',
  },
};

export default function ShopOwnerSignUpPage() {
  return <SignUpClient />;
}