import { useState } from 'react';
import { useLocation } from 'wouter';
import VideoCard from './VideoCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { type Video } from '@shared/schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';

const RecommendedSection = () => {
  const [, navigate] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const { user, isAdmin } = useAuth();
  
  // Fetch videos - in a real app, this would be filtered by recommendation algorithm
  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: ['/api/videos', isAdmin ? 'admin' : 'user'],
    queryFn: async () => {
      const res = await apiRequest('GET', isAdmin ? '/api/videos?isAdmin=true' : '/api/videos');
      return res.json();
    },
  });
  
  // Mock data for demo purposes if no videos available
  const mockVideos = [
    {
      id: 11,
      title: 'Interstellar Voyages',
      description: '',
      category: 'Sci-Fi',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      duration: 7200,
      isLive: false,
      createdAt: new Date('2023-01-15'),
    },
    {
      id: 12,
      title: 'The Last Detective',
      description: '',
      category: 'Crime Drama',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559108318-39ed452bb6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      duration: 5400,
      isLive: false,
      createdAt: new Date('2022-11-03'),
    },
    {
      id: 13,
      title: 'The Crown',
      description: '',
      category: 'Historical Drama',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      duration: 6300,
      isLive: false,
      createdAt: new Date('2020-05-22'),
    },
    {
      id: 14,
      title: 'Office Laughs',
      description: '',
      category: 'Comedy',
      thumbnailUrl: 'https://images.unsplash.com/photo-1601513445506-b3282f752846?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      duration: 4500,
      isLive: false,
      createdAt: new Date('2021-09-17'),
    },
    {
      id: 15,
      title: 'Enchanted Realms',
      description: '',
      category: 'Fantasy',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://res.cloudinary.com/dwfkishzf/video/upload/v1700507149/netflix-placeholder_oibxmq.mp4',
      duration: 5100,
      isLive: false,
      createdAt: new Date('2023-03-10'),
    }
  ];
  
  // Use actual data or fallback to mock data if empty
  const displayVideos = (videos && videos.length > 0) ? videos : mockVideos;
  
  // Calculate match percentage (would normally come from recommendation algorithm)
  const getMatchPercentage = (id: number): number => {
    // This is a mock function - in real app would use user preferences
    return Math.floor(80 + Math.sin(id) * 20);
  };
  
  const getVideoYear = (video: typeof displayVideos[0]): string => {
    return video.createdAt ? new Date(video.createdAt).getFullYear().toString() : new Date().getFullYear().toString();
  };
  
  const handleViewAll = () => {
    navigate('/recommended');
  };
  
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollContainer = document.getElementById('recommended-scroll-container');
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
        <h2 className="text-xl md:text-2xl font-bold">Recommended For You</h2>
        <Button 
          onClick={handleViewAll}
          variant="link" 
          className="text-gray-400 hover:text-white"
        >
          View All
        </Button>
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap" id="recommended-scroll-container">
          <div className="flex space-x-4 pb-4">
            {displayVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl || ''}
                matchPercentage={getMatchPercentage(video.id)}
                year={getVideoYear(video)}
                type="video"
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

export default RecommendedSection;
