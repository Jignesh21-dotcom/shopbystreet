'use client';
import ShopPageClient from './ShopPageClient';

export default async function ShopPage({
  params,
}: {
  params: Promise<{ city: string; street: string; shop: string }>;
}) {
  const resolvedParams = await params; // Resolve the promise if params is asynchronous
  return <ShopPageClient params={resolvedParams} />;
}