'use client';

import "~/styles/globals.css";
import { WagmiConfig } from 'wagmi';
import { config } from '@/lib/web3modal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Providers } from "~/components/Providers";
import { DisableZoom } from "~/components/DisableZoom";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={config}>
            <Providers>
              <DisableZoom />
              {children}
            </Providers>
          </WagmiConfig>
        </QueryClientProvider>
      </body>
    </html>
  );
}
