import { useState } from 'react';
import { useLocation } from 'wouter';
import VideoCard from './VideoCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { type Stream } from '@shared/schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ComingSoonSection = () => {
  const [, navigate] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Fetch upcoming streams
  const { data: upcomingStreams, isLoading, error } = useQuery<Stream[]>({
    queryKey: ['/api/streams/upcoming'],
  });
  
  // Mock data for demo purposes if no streams available
  const mockUpcomingStreams = [
    {
      id: 6,
      title: 'Dark Matter',
      description: 'Season 1 Premiere',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: false,
      startTime: new Date(Date.now() + 86400000), // tomorrow
      viewerCount: 0,
    },
    {
      id: 7,
      title: 'Ocean Depths',
      description: 'Documentary Series',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: false,
      startTime: new Date(Date.now() + 2 * 86400000), // in 2 days
      viewerCount: 0,
    },
    {
      id: 8,
      title: 'The Inheritance',
      description: 'New Original Series',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: false,
      startTime: new Date(Date.now() + 4 * 86400000), // Friday
      viewerCount: 0,
    },
    {
      id: 9,
      title: 'Lost Kingdom',
      description: 'Adventure Film',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: false,
      startTime: new Date(Date.now() + 7 * 86400000), // next week
      viewerCount: 0,
    },
    {
      id: 10,
      title: 'Digital Frontier',
      description: 'Tech Thriller',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      streamUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      isLive: false,
      startTime: new Date(Date.now() + 15 * 86400000), // Aug 15
      viewerCount: 0,
    }
  ];
  
  // Use actual data or fallback to mock data if empty
  const displayStreams = (upcomingStreams && upcomingStreams.length > 0) ? upcomingStreams : mockUpcomingStreams;
  
  // Helper to format the date for display
  const formatStreamDate = (startTime: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'TODAY';
    } else if (diffDays === 1) {
      return 'TOMORROW';
    } else if (diffDays <= 7) {
      return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][startTime.getDay()];
    } else {
      return startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    }
  };
  
  const handleViewAll = () => {
    navigate('/upcoming');
  };
  
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollContainer = document.getElementById('upcoming-scroll-container');
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
    <section className="px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Coming Soon</h2>
        <Button 
          onClick={handleViewAll}
          variant="link" 
          className="text-gray-400 hover:text-white"
        >
          View All
        </Button>
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap" id="upcoming-scroll-container">
          <div className="flex space-x-4 pb-4">
            {displayStreams.map((stream) => (
              <VideoCard
                key={stream.id}
                id={stream.id}
                title={stream.title}
                description={stream.description || ''}
                thumbnailUrl={stream.thumbnailUrl || ''}
                isLive={false}
                isUpcoming={true}
                streamDate={formatStreamDate(new Date(stream.startTime))}
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

export default ComingSoonSection;
