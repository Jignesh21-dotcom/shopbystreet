import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer'; // ✅ Import the footer
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
      <head>
        {/* ✅ Google Ads Global Site Tag */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-964296211"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-964296211');
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} min-h-screen bg-gray-100 flex flex-col`}>
        <Header />
        <main className="flex-grow px-4">{children}</main>
        <Footer /> {/* ✅ Sticky Footer always at bottom */}
      </body>
    </html>
  );
}
