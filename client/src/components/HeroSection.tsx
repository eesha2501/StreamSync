import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/ui/video-player';
import { Play, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { type Stream, type Video } from '@shared/schema';

interface HeroSectionProps {
  videoId?: number;
  streamId?: number;
}

const HeroSection = ({ videoId, streamId }: HeroSectionProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [muted, setMuted] = useState(true);
  
  // Fetch featured video or stream data
  const { data: featuredVideo } = useQuery<Video>({
    queryKey: videoId ? ['/api/videos', videoId] : undefined,
    enabled: !!videoId
  });
  
  const { data: featuredStream } = useQuery<Stream>({
    queryKey: streamId ? ['/api/streams', streamId] : undefined,
    enabled: !!streamId
  });
  
  // Use the stream data if available, otherwise use video data
  const featured = featuredStream || featuredVideo;
  
  // Fallback data if no featured content is available
  const fallbackData = {
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    category: "Sci-Fi",
    isLive: true,
    viewerCount: 156000,
    videoUrl: "https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4",
    posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  };
  
  const handlePlay = () => {
    if (featured) {
      navigate(streamId ? `/watch/stream/${streamId}` : `/watch/video/${videoId}`);
    } else {
      toast({
        title: "Demo Only",
        description: "This is a demo feature without actual video content.",
      });
    }
  };
  
  const handleMoreInfo = () => {
    if (featured) {
      navigate(streamId ? `/details/stream/${streamId}` : `/details/video/${videoId}`);
    } else {
      toast({
        title: "Demo Only",
        description: "This is a demo feature without actual content details.",
      });
    }
  };

  return (
    <section className="relative pt-16">
      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
        {/* Video background */}
        {featured ? (
          <VideoPlayer
            videoId={videoId}
            streamId={streamId}
            videoUrl={featured.videoUrl || featured.streamUrl}
            isLive={featured.isLive}
            poster={featured.thumbnailUrl}
            autoplay={true}
            controls={false}
            disableSeekBackward={true}
          />
        ) : (
          <div className="absolute inset-0 bg-[#141414]">
            <img 
              src={fallbackData.posterUrl} 
              alt="Featured content" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"></div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3 lg:w-1/2">
          <div className="flex items-center mb-4">
            {(featured?.isLive || fallbackData.isLive) && (
              <>
                <span className="bg-[#E50914] text-white px-2 py-1 text-xs font-bold mr-2">LIVE NOW</span>
                <span className="text-[#46D369] text-sm flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#46D369] animate-pulse mr-1"></span>
                  {featured?.viewerCount 
                    ? `${(featured.viewerCount / 1000).toFixed(1)}K viewers` 
                    : `${(fallbackData.viewerCount / 1000).toFixed(1)}K viewers`}
                </span>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {featured?.title || fallbackData.title}
          </h1>
          
          <p className="text-lg md:text-xl mb-4">
            {streamId ? 'Live Stream' : 'Featured Content'}
          </p>
          
          <div className="flex flex-wrap space-x-2 mb-4">
            <span className="bg-[#221F1F] px-2 py-1 text-xs rounded">
              {featured?.category || fallbackData.category}
            </span>
            <span className="bg-[#221F1F] px-2 py-1 text-xs rounded">Drama</span>
            <span className="bg-[#221F1F] px-2 py-1 text-xs rounded">Horror</span>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-xl">
            {featured?.description || fallbackData.description}
          </p>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handlePlay}
              className="bg-white text-[#141414] hover:bg-opacity-80"
            >
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
            
            <Button 
              onClick={handleMoreInfo}
              variant="secondary" 
              className="bg-[#564D4D] bg-opacity-60 text-white hover:bg-opacity-80"
            >
              <Info className="mr-2 h-4 w-4" /> More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
