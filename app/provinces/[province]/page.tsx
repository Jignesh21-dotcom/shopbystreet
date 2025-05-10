import ProvinceClient from './ProvinceClient';

type ProvincePageProps = {
  params: {
    province: string;
  };
};

// ✅ Use `getStaticProps` to handle dynamic routes
export async function getStaticPaths() {
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

  const paths = provinces.map((province) => ({
    params: { province },
  }));

  return {
    paths,
    fallback: false, // Only generate static pages for the defined paths
  };
}

export async function getStaticProps({ params }: { params: { province: string } }) {
  return {
    props: {
      province: params.province,
    },
  };
}

// ✅ Explicitly type the `ProvincePage` component
export default function ProvincePage({ province }: { province: string }) {
  return <ProvinceClient province={province} />;
}