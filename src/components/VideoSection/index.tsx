'use client';

export const VideoSection = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-black/60 to-black/40">
      <div className="container mx-auto h-full flex items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-5xl aspect-video bg-black/30 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10">
          <div className="w-full h-full p-1">
            <div className="w-full h-full rounded-xl overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                poster="/video-poster.jpg"
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 