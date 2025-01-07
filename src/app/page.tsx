import { TokenList } from '@/components/TokenList';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="text-[#21d4e0] text-2xl font-bold animate-arrow-left">&lt;</span>
            <span className="text-[#21d4e0] text-2xl font-bold animate-arrow-left [animation-delay:75ms]">&lt;</span>
            <span className="text-[#21d4e0] text-2xl font-bold animate-arrow-left [animation-delay:150ms]">&lt;</span>
          </div>
          
          <button
            className="relative px-8 py-3 text-sm font-medium rounded-lg text-white hover:opacity-100 focus:outline-none transition-all duration-300 transform hover:scale-105 mx-4 bg-black overflow-hidden group"
            style={{
              boxShadow: '0 0 20px rgba(118,249,81,0.2)',
            }}
          >
            <span className="absolute inset-0 w-full h-full bg-[#76f951] opacity-30 group-hover:opacity-40 transition-opacity" />
            <span className="absolute inset-[2px] rounded-lg bg-black" />
            <span className="absolute inset-0 w-full h-full bg-[#76f951] opacity-50 blur-xl group-hover:opacity-75 transition-opacity animate-breath-glow" />
            
            <span className="relative z-10 inline-flex items-center text-[#76f951] font-semibold">
              Create Token
              <svg 
                className="ml-2 w-4 h-4 animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{
                  stroke: '#76f951'
                }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </span>
          </button>

          <div className="flex gap-1">
            <span className="text-[#76f951] text-2xl font-bold animate-arrow-right">&gt;</span>
            <span className="text-[#76f951] text-2xl font-bold animate-arrow-right [animation-delay:75ms]">&gt;</span>
            <span className="text-[#76f951] text-2xl font-bold animate-arrow-right [animation-delay:150ms]">&gt;</span>
          </div>
        </div>
      </div>
      <TokenList />
    </main>
  );
}
