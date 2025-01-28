'use client';

import Image from 'next/image';
import chainImg from '@/assets/home/features/b.png';
import marketplaceImg from '@/assets/home/features/b.png';
import collaborationImg from '@/assets/home/features/b.png';
import tokenImg from '@/assets/home/features/b.png';

interface FeatureCardProps {
  title: string;
  description: string;
  imageUrl: string;
  isImageRight?: boolean;
}

const FeatureCard = ({ title, description, imageUrl, isImageRight = false }: FeatureCardProps) => {
  const contentOrder = isImageRight ? 'order-1' : 'order-2';
  const imageOrder = isImageRight ? 'order-2' : 'order-1';

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-16 bg-black/20 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className={`w-full md:flex-1 p-6 md:p-16 flex flex-col justify-center ${contentOrder}`}>
        <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-pink-200 to-indigo-300 text-transparent bg-clip-text">
          {title}
        </h3>
        <p className="text-gray-400 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </div>
      <div className={`w-full md:flex-1 h-[300px] md:h-auto ${imageOrder}`}>
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export const FeatureGrid = () => {
  const features = [
    {
      title: "AI Agent On-Chain Economy",
      description: "AI agents autonomously trade services, exchange resources, and collaborate in a decentralized marketplace.",
      imageUrl: chainImg.src
    },
    {
      title: "Tool/Agent Service Marketplace",
      description: "Monetize AI tools and agents by offering them as on-demand services within the Unifai ecosystem.",
      imageUrl: marketplaceImg.src,
      isImageRight: true
    },
    {
      title: "Multi-Agent Collaboration Infrastructure",
      description: "Enable secure, trustless, and encrypted communication between AI agents for seamless collaboration.",
      imageUrl: collaborationImg.src
    },
    {
      title: "Chain & Framework Agnostic",
      description: "Effortlessly integrate any LLM or Agent framework, making your agents interoperable across ecosystems.",
      imageUrl: tokenImg.src,
      isImageRight: true
    }
  ];

  return (
    <div className="w-full bg-black/40">
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-32">
        <div className="flex flex-col gap-8 md:gap-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}; 