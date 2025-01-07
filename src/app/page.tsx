"use client";
import { MapUI } from "~/components/MapUI";
import dynamic from 'next/dynamic';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { Suspense } from 'react';
import Image from 'next/image';
import logo from "@/assets/logo.png";
import loadingbg from "@/assets/loadingbg.png";
import { PlayerList } from "~/components/PlayerList";
import { BuildingList } from "~/components/BuildingList";
import React, { memo } from "react";
import { ChatHistoryMarquee } from "@/components/ChatHistoryMarquee";

const MemoizedPlayerList = memo(PlayerList);
MemoizedPlayerList.displayName = 'MemoizedPlayerList';

const MemoizedBuildingList = memo(BuildingList);
MemoizedBuildingList.displayName = 'MemoizedBuildingList';

const ConnectedLists = memo(() => {
  return (
    <div className="flex min-h-screen relative justify-between">
      <div className="w-[320px] relative">
        <MemoizedPlayerList />
      </div>

      <div className="w-[320px] relative">
        <MemoizedBuildingList />
      </div>
    </div>
  );
});

ConnectedLists.displayName = 'ConnectedLists';

function GameContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <MapUI />
      </div>
      <div className="ml-auto w-[95vw] pt-24 px-8 pb-8">
        <div className="min-h-[100px] flex flex-col items-center justify-center mb-12">
          <h1 className="text-4xl font-black text-center
            bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400
            hover:scale-105 transition-transform duration-300 uppercase tracking-[0.2em] leading-relaxed">
            An AI-Native, Modular Infrastructure for
          </h1>
          <h2 className="text-xl font-medium mt-2 tracking-widest
            text-slate-300/80 uppercase">
            Autonomous AI Agents Collaboration and Tools Integration
          </h2>
        </div>
        <ChatHistoryMarquee />
        <ConnectedLists />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-black/30">
      <RecoilRoot>
        <Suspense fallback={<div>Loading...</div>}>
          <GameContent />
        </Suspense>
      </RecoilRoot>
    </div>
  );
}
