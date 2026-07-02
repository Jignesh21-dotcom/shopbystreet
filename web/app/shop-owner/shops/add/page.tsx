import type { Metadata } from 'next';
import AddShopClient from './AddShopClient';

export const metadata: Metadata = {
  title: 'Add Your Shop | Shop Owner | LocalStreetShop',
  description:
    'Add your local business to LocalStreetShop and connect with nearby customers online.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/shops/add',
  },
};

export default function AddShopPage() {
  return <AddShopClient />;
}