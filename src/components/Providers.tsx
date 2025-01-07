'use client'

import { SessionProvider } from "next-auth/react"
import { RecoilRoot } from 'recoil';
import { ConfigProvider, theme } from 'antd';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RecoilRoot>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorBgBase: '#000000',
              colorTextBase: '#ffffff',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </RecoilRoot>
    </SessionProvider>
  )
}
