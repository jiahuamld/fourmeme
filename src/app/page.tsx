import { TokenList } from '@/components/TokenList';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <TokenList />
    </main>
  );
}
