import ProvinceClient from './ProvinceClient';

type ProvincePageProps = {
  params: {
    province: string;
  };
};

export default function ProvincePage({ params }: ProvincePageProps) {
  return <ProvinceClient province={params.province} />;
}