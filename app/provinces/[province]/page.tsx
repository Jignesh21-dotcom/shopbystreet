import ProvinceClient from './ProvinceClient';

type ProvincePageProps = {
  params: {
    province: string;
  };
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

  return provinces.map((province) => ({
    province,
  }));
}

// ✅ Explicitly type the `ProvincePage` component
export default function ProvincePage({ params }: ProvincePageProps) {
  return <ProvinceClient province={params.province} />;
}