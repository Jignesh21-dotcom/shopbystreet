import type { Metadata } from 'next';
import IndiaBusinessSubmissionClient from './IndiaBusinessSubmissionClient';

export const metadata: Metadata = {
  title: 'Add Your India Business | LocalStreetShop',
  description: 'Submit an Indian local business, market, street, building, or village location for admin verification.',
};

export default function AddIndiaBusinessPage() {
  return <IndiaBusinessSubmissionClient />;
}
