import type { Metadata } from 'next';
import OrdersClient from './OrdersClient';

export const metadata: Metadata = {
  title: 'Order Requests | Shop Owner | LocalStreetShop',
  description:
    'View customer Order Requests for your LocalStreetShop businesses.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/orders',
  },
};

export default function OrdersPage() {
  return <OrdersClient />;
}