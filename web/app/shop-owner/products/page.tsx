import type { Metadata } from 'next';
import ProductsClient from '@/app/shop-owner/products/ProductsClient';

export const metadata: Metadata = {
  title: 'Manage Products | LocalStreetShop',
  description:
    'Shop owners can view, add, edit, and manage products listed on LocalStreetShop.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/products',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}