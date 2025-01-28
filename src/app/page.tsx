'use client';

import { HomeHero } from '@/components/HomeHero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { VideoSection } from '@/components/VideoSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto">
      <HomeHero />
      <VideoSection />
      <FeatureGrid />
      <Footer />
    </div>
  );
}
