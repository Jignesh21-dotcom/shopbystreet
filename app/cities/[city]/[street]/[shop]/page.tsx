import ShopPageClient from './ShopPageClient';

export default function ShopPage({
  params,
}: {
  params: { city: string; street: string; shop: string };
}) {
  return <ShopPageClient params={params} />;
}
