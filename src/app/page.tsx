'use client';

// import { Header } from '@/components/Header';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="relative">
        {/* <Header /> */}
        <Suspense fallback={<div>Loading...</div>}>
        12
        </Suspense>
      </div>
    </main>
  );
}
