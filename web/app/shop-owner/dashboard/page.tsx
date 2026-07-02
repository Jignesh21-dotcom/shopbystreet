import type { Metadata } from 'next';
import ShopOwnerDashboardClient from './ShopOwnerDashboardClient';

export const metadata: Metadata = {
  title: 'Shop Owner Dashboard | LocalStreetShop',
  description: 'Manage your local business listing and products.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/dashboard',
  },
};

export default function ShopOwnerDashboardPage() {
  return <ShopOwnerDashboardClient />;
}