import { TokenList } from '@/components/TokenList';
import { Header } from '@/components/Header';
import { CreateTokenButton } from '@/components/CreateTokenButton';

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Header />
      <CreateTokenButton />
      <TokenList />
    </main>
  );
}
