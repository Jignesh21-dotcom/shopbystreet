import './globals.css';
import Header from './components/Header';
import { Poppins } from 'next/font/google';

export const metadata = {
  title: 'Shop Street',
  description: 'Discover shops on every street!',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-screen bg-gray-100`}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
