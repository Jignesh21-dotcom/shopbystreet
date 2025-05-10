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

  const staticParams = provinces.map((province) => ({
    province,
  }));

  // Debugging log to verify the structure of staticParams
  console.log('Static Params:', staticParams);

  return staticParams;
}

// ✅ Explicitly type the `ProvincePage` component
export default function ProvincePage({ params }: ProvincePageProps) {
  // Debugging log to verify the structure of params
  console.log('Params:', params);

  return <ProvinceClient province={params.province} />;
}