import { FC } from 'react';
import { notFound } from 'next/navigation';
import TokenDetail from '@/components/TokenDetail';

interface PageProps {
  params: {
    address: string;
  };
}

const TokenDetailPage: FC<PageProps> = ({ params }) => {
  const { address } = params;

  if (!address) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TokenDetail address={address} />
    </div>
  );
};

export default TokenDetailPage; 