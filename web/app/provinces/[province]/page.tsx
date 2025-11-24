import ProvinceClient from './ProvinceClient';
import SEO from '@/app/components/SEO';


type ProvincePageProps = {
  params: any;
};

// ✅ Use `generateStaticParams` to handle dynamic routes
export async function generateStaticParams() {
  const provinces = [
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

  return provinces.map((province) => ({ province }));
}

export const dynamic = 'force-dynamic'; // Disable static generation

export default async function ProvincePage({ params }: ProvincePageProps) {
  const { province } = await params;

  const displayName = decodeURIComponent(province)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const title = `Explore Cities in ${displayName} | Local Street Shop`;
  const description = `Browse cities in ${displayName} and discover local businesses street by street.`;
  const url = `https://www.localstreetshop.com/provinces/${province}`;

  return (
    <>
      <SEO title={title} description={description} url={url} />
      <ProvinceClient province={province} />
    </>
  );
}
