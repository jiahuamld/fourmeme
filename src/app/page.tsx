// import { TokenList } from '@/components/TokenList';
import { Header } from '@/components/Header';
import { CreateTokenButton } from '@/components/CreateTokenButton';
import { PhantomTransactionButton } from '@/components/PhantomTransactionButton';
// import Spline from '@splinetool/react-spline/next';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* <div className="absolute inset-0 z-0">
        <Spline
        
          scene="https://prod.spline.design/5TXBXYeqr0wmhAJY/scene.splinecode"

        />
      </div>
      <div className="absolute bottom-4 right-4 w-[150px] h-[100px] bg-black z-20 rounded-lg" /> */}
      <div className="relative z-10">
        <Header />
        <PhantomTransactionButton 
          senderAddress="FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T"  // Solana 格式的发送方地址
          recipientAddress="3FSqX4cqGqkc3GQrxz8iRWGNtUsiFPKJF7FaxMy8fpdP"  // Solana 格式的接收方地址
          amount={100000000}  // 0.1 SOL
        />
        {/* <TokenList /> */}
      </div>
    </main>
  );
}
