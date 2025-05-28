// components/SEO.tsx
import Head from 'next/head';

type SEOProps = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
};

export default function SEO({ title, description, image, url }: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
