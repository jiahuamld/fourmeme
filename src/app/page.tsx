'use client';

import { Header } from '@/components/Header';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="relative z-10">
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
        1
        </Suspense>
      </div>
    </main>
  );
}
