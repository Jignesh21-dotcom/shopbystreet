import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { Poppins } from 'next/font/google';
import Script from 'next/script'; // ✅ Required for GTM

export const metadata = {
  title: 'Shop Street',
  description: 'Discover shops on every street!',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Tag Manager Head Script */}
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
      <body className={`${poppins.className} min-h-screen bg-gray-100 flex flex-col`}>
        {/* ✅ Google Tag Manager Noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCD44KWZ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Header />
        <main className="flex-grow px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
