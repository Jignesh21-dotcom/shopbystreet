import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.localstreetshop.com'),

  title: {
    default: 'LocalStreetShop',
    template: '%s | LocalStreetShop',
  },

  description:
    'Discover local shops, support independent businesses, and explore cities, streets, and communities across Canada and India.',

  keywords: [
    'LocalStreetShop',
    'shop local',
    'Canadian businesses',
    'Indian businesses',
    'local shopping',
    'Ontario businesses',
    'Gujarat businesses',
    'digital main street',
    'small businesses Canada',
    'local business directory',
  ],

  authors: [{ name: 'LocalStreetShop' }],
  creator: 'LocalStreetShop',
  publisher: 'LocalStreetShop',

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: 'LocalStreetShop',
    description:
      'Discover local shops, support independent businesses, and explore cities, streets, and communities across Canada and India.',
    url: 'https://www.localstreetshop.com',
    siteName: 'LocalStreetShop',
    locale: 'en_CA',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LocalStreetShop',
    description:
      'Discover local shops, support independent businesses, and explore cities, streets, and communities across Canada and India.',
  },

  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
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
    <html lang="en-CA">
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WCD44KWZ');`,
          }}
        />
      </head>

      <body
        className={`${poppins.className} flex min-h-screen flex-col bg-white`}
        suppressHydrationWarning
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCD44KWZ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Header />

        <main className="flex-grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}