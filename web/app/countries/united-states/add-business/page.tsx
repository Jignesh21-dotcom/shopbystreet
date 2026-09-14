import type { Metadata } from 'next';
import USBusinessSubmissionClient from './USBusinessSubmissionClient';
export const metadata: Metadata = { title: 'Add a U.S. Business | LocalStreetShop', description: 'Submit a United States local business and its street location for review.' };
export default function Page(){ return <USBusinessSubmissionClient/>; }
