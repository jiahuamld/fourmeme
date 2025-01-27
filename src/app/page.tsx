<<<<<<< HEAD
'use client';

import { Header } from '@/components/Header';
import { Suspense } from 'react';
=======

import { Header } from '@/components/Header';
import { CreateTokenButton } from '@/components/CreateTokenButton';
import { PhantomTransactionButton } from '@/components/PhantomTransactionButton';

>>>>>>> main

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="relative z-10">
        <Header />
<<<<<<< HEAD
        <Suspense fallback={<div>Loading...</div>}>
        1
        </Suspense>
=======
        <PhantomTransactionButton 
          senderAddress="FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T" 
          recipientAddress="3FSqX4cqGqkc3GQrxz8iRWGNtUsiFPKJF7FaxMy8fpdP" 
          amount={100000000} 
        />
>>>>>>> main
      </div>
    </main>
  );
}
