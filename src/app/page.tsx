'use client';

import { HomeHero } from '@/components/HomeHero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { VideoSection } from '@/components/VideoSection';

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto">
      <HomeHero />
      <VideoSection />
      <FeatureGrid />
    </div>
  );
}
