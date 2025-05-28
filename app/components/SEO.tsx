import Head from 'next/head';

type SEOProps = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
};

export default function SEO({ title, description, image, url, noindex }: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
