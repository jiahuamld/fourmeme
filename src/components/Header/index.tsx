import Image from 'next/image';

export const Header = () => {
  return (
    <header className="w-full bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">clanker</h1>
          </div>
          
          <button
            className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21d4e0] transition-opacity"
            style={{
              background: 'linear-gradient(90deg, #76f951, #21d4e0)'
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}; 