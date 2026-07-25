import type { Metadata } from 'next';
import { Suspense } from 'react';
import ClaimShopClient from '@/app/shop-owner/claim/ClaimShopClient';

export const metadata: Metadata = {
  title: 'Claim Your Shop | LocalStreetShop',
  description:
    'Are you the owner of a shop listed on LocalStreetShop? Submit a claim request to manage your listing and showcase your business.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/shop-owner/claim',
  },
};

export default function ClaimShopPage() {
  return (
    <Suspense fallback={null}>
      <ClaimShopClient />
    </Suspense>
  );
}