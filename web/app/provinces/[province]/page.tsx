import ProvinceClient from './ProvinceClient';
import SEO from '@/app/components/SEO';

type ProvincePageProps = {
  params: Promise<{
    province: string;
  }>;
};

const provinceSlugs = [
  'ontario',
  'quebec',
  'british-columbia',
  'alberta',
  'manitoba',
  'saskatchewan',
  'nova-scotia',
  'new-brunswick',
  'newfoundland-and-labrador',
  'prince-edward-island',
  'northwest-territories',
  'nunavut',
  'yukon',
];

export async function generateStaticParams() {
  return provinceSlugs.map((province) => ({ province }));
}

export const dynamic = 'force-dynamic';

const formatProvinceName = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default async function ProvincePage({ params }: ProvincePageProps) {
  const { province } = await params;
  const displayName = formatProvinceName(province);

  const title = `Explore Cities in ${displayName} | LocalStreetShop`;
  const description = `Browse cities in ${displayName} and discover local businesses, shops, restaurants, and services street by street.`;
  const url = `https://www.localstreetshop.com/provinces/${province}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
      <ProvinceClient province={province} provinceName={displayName} />
    </>
  );
}