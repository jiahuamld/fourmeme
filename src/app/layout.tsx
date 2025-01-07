import "~/styles/globals.css";
import { Inter } from 'next/font/google';
import { type Metadata } from "next";
import { Providers } from "~/components/Providers";
import { DisableZoom } from "~/components/DisableZoom";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "AIVENGERS",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          <DisableZoom />
          <div className={inter.className}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
