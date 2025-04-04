import { useState } from 'react';
import { useLocation } from 'wouter';
import VideoCard from './VideoCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { type Stream } from '@shared/schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const LiveNowSection = () => {
  const [, navigate] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Fetch live streams
  const { data: liveStreams, isLoading, error } = useQuery<Stream[]>({
    queryKey: ['/api/streams/live'],
  });
  
  // Mock data for demo purposes if no streams available
  const mockLiveStreams = [
    {
      id: 1,
      title: 'NBA Finals 2023',
      description: 'Game 5 - Live from Boston',
      thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: true,
      viewerCount: 34000,
      startTime: new Date(),
    },
    {
      id: 2,
      title: 'Coldplay World Tour',
      description: 'Live from Tokyo Stadium',
      thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: true,
      viewerCount: 78000,
      startTime: new Date(),
    },
    {
      id: 3,
      title: 'Breaking News',
      description: 'Global News Network',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: true,
      viewerCount: 41000,
      startTime: new Date(),
    },
    {
      id: 4,
      title: 'League Championships',
      description: 'Finals - Team Liquid vs G2',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: true,
      viewerCount: 129000,
      startTime: new Date(),
    },
    {
      id: 5,
      title: "Chef's Table Live",
      description: 'Holiday Special Edition',
      thumbnailUrl: 'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: true,
      viewerCount: 22000,
      startTime: new Date(),
    }
  ];
  
  // Use actual data or fallback to mock data if empty
  const displayStreams = (liveStreams && liveStreams.length > 0) ? liveStreams : mockLiveStreams;
  
  const handleViewAll = () => {
    navigate('/live');
  };
  
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollContainer = document.getElementById('live-scroll-container');
    if (scrollContainer) {
      const scrollAmount = 250 * (direction === 'left' ? -1 : 1);
      const newPosition = scrollPosition + scrollAmount;
      
      scrollContainer.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="px-4 md:px-8 py-8 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold flex items-center">
          Live Now 
          <span className="ml-2 h-2 w-2 rounded-full bg-[#46D369] animate-pulse"></span>
        </h2>
        <Button 
          onClick={handleViewAll}
          variant="link" 
          className="text-gray-400 hover:text-white"
        >
          View All
        </Button>
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap" id="live-scroll-container">
          <div className="flex space-x-4 pb-4">
            {displayStreams.map((stream) => (
              <VideoCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                description={stream.description || ''}
                thumbnailUrl={stream.thumbnailUrl || ''}
                isLive={stream.isLive}
                viewerCount={stream.viewerCount}
                type="stream"
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-black bg-opacity-50 text-white"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-black bg-opacity-50 text-white"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LiveNowSection;
