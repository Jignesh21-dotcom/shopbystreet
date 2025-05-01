import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'Shop Street',
  description: 'Discover shops on every street!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
