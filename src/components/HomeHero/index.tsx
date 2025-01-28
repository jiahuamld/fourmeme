'use client';

import { Suspense } from 'react';
import bgImage from '@/assets/home/screen1/bg.avif';
import py from '@/assets/home/screen1/py.png';
import js from '@/assets/home/screen1/js.png';
import logo from '@/assets/home/screen1/logo.png';
import Image from 'next/image';

export const HomeHero = () => {
  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-gradient-to-b from-black/10 to-black/60"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start h-full pt-[15vh] px-8">
        <Image src={logo} alt="Python" width={220} height={200} className="mb-4" />
        <p 
          className="mt-6 text-4xl font-bold tracking-wide text-center max-w-4xl leading-relaxed bg-gradient-to-r from-[#fdebdf] to-[#959cfb] text-transparent bg-clip-text"
        >
          An AI-Native Infrastructure For Dynamic Tools {'\n'}
          and Agent to Agent Communication
        </p>
        <div className="mt-16 flex space-x-28">
          <div className="text-center">
            <Image src={py} alt="Python" width={200} height={200} className="mb-4" />
          </div>
          <div className="text-center">
            <Image src={js} alt="JavaScript" width={200} height={200} className="mb-4" />
          </div>
        </div>
      </div>
    </div>
  );
}; 