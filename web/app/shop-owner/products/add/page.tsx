import type { Metadata } from 'next';
import AddProductClient from '@/app/shop-owner/products/add/AddProductClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Add Product | Shop Owner | LocalStreetShop',
  description:
    'Add a product to your LocalStreetShop business listing with price, description, and image.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/products/add',
  },
};

export default function AddProductPage() {
  return <AddProductClient />;
}