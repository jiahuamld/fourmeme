import { TokenList } from '@/components/TokenList';
import { Header } from '@/components/Header';
import { CreateTokenButton } from '@/components/CreateTokenButton';
import Spline from '@splinetool/react-spline/next';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <Spline
        
          scene="https://prod.spline.design/pYGLUJ7agAMvx6Mu/scene.splinecode"

        />
      </div>
      <div className="absolute bottom-4 right-4 w-[150px] h-[100px] bg-black z-20 rounded-lg" />
      <div className="relative z-10">
        <Header />
        {/* <CreateTokenButton /> */}
        <TokenList />
      </div>
    </main>
  );
}
