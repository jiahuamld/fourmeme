'use client';

// import { Header } from '@/components/Header';
import { Suspense } from 'react';
import bgImage from '@/assets/home/screen1/bg.avif';
import py from '@/assets/home/screen1/py.png';
import js from '@/assets/home/screen1/js.png';
import Image from 'next/image';

export default function Home() {
  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-gradient-to-b from-black/10 to-black/60"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-start h-full pt-[15vh]">
        <h1 className="text-7xl font-bold text-white duration-300 ease-in-out tracking-wider drop-shadow-lg">
          UnifAI
        </h1>
        <p className="mt-4 text-4xl font-semibold tracking-wide text-center max-w-5xl leading-relaxed bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
          An AI-Native Infrastructure For Dynamic Tools {'\n'}
          and Agent to Agent Communication
        </p>
        <div className="mt-12 flex space-x-28">
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
}
