import type { Metadata } from 'next';
import ManageShopClient from './ManageShopClient';

export const metadata: Metadata = {
  title: 'Manage Shop | Shop Owner | LocalStreetShop',
  description: 'Edit your shop details, storefront photo, contact information, hours, and public business listing.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageShopPage() {
  return <ManageShopClient />;
}