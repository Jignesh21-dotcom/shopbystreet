import { PageProps } from 'next'; // ✅ Import PageProps type
import ShopPageClient from './ShopPageClient';

export default function ShopPage({ params }: PageProps) {
  return <ShopPageClient params={params} />;
}
