import type { Metadata } from 'next';
import OrderRequestTrackingClient from './OrderRequestTrackingClient';

type PageProps = {
  params: Promise<{ requestNumber: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { requestNumber } = await params;

  return {
    title: `${decodeURIComponent(
      requestNumber,
    )} | Order Request | LocalStreetShop`,
    description:
      'Track the status of your LocalStreetShop Order Request.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderRequestTrackingPage({
  params,
}: PageProps) {
  const { requestNumber } = await params;

  return (
    <OrderRequestTrackingClient
      requestNumber={decodeURIComponent(requestNumber)}
    />
  );
}