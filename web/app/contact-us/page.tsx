import type { Metadata } from 'next';
import ContactClient from '@/app/contact-us/ContactClient';

export const metadata: Metadata = {
  title: 'Contact LocalStreetShop | Support for Local Businesses',
  description:
    'Contact LocalStreetShop for help with shop listings, product uploads, business claims, partnerships, or general questions.',
  alternates: {
    canonical: 'https://www.localstreetshop.com/contact-us',
  },
};

export default function ContactUsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const initialSubject =
    typeof searchParams?.subject === 'string' ? searchParams.subject : null;

  return <ContactClient initialSubject={initialSubject} />;
}