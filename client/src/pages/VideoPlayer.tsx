import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { VideoPlayer as VideoPlayerComponent } from '@/components/ui/video-player';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { type Stream, type Video } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const VideoPlayer = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Fetch video or stream data
  const { data: videoData, isLoading: videoLoading } = useQuery<Video>({
    queryKey: type === 'video' ? ['/api/videos', parseInt(id)] : undefined,
    enabled: type === 'video' && !!id && !!user,
  });
  
  const { data: streamData, isLoading: streamLoading } = useQuery<Stream>({
    queryKey: type === 'stream' ? ['/api/streams', parseInt(id)] : undefined,
    enabled: type === 'stream' && !!id && !!user,
  });
  
  // Get content data based on type
  const contentData = type === 'video' ? videoData : streamData;
  const isLoading = (type === 'video' ? videoLoading : streamLoading) || authLoading;
  
  // Handle errors - invalid type or missing content
  useEffect(() => {
    if (!isLoading && !contentData) {
      toast({
        title: "Content Not Found",
        description: `The requested ${type} could not be found`,
        variant: "destructive"
      });
      navigate('/');
    }
  }, [contentData, isLoading, type, toast, navigate]);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const playerContainer = document.getElementById('video-player-container');
    
    if (!playerContainer) return;
    
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          toast({
            title: "Fullscreen Error",
            description: `Error attempting to enable fullscreen: ${err.message}`,
            variant: "destructive"
          });
        });
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => {
          toast({
            title: "Fullscreen Error",
            description: `Error attempting to exit fullscreen: ${err.message}`,
            variant: "destructive"
          });
        });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/');
  };

  if (isLoading || !contentData) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className={isFullscreen ? 'hidden' : 'block'}>
        <Navbar />
      </div>
      
      <div 
        id="video-player-container" 
        className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'pt-20 px-4 container mx-auto'}`}
      >
        <div className={`${isFullscreen ? 'hidden' : 'flex items-center mb-4'}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold ml-4">{contentData.title}</h1>
        </div>
        
        <VideoPlayerComponent
          videoId={type === 'video' ? parseInt(id) : undefined}
          streamId={type === 'stream' ? parseInt(id) : undefined}
          videoUrl={type === 'video' ? (videoData?.videoUrl || '') : (streamData?.streamUrl || '')}
          isLive={type === 'stream' && (streamData?.isLive || false)}
          poster={contentData.thumbnailUrl}
          title={contentData.title}
          onError={(error) => {
            console.error('Video player error:', error);
            toast({
              title: "Playback Error",
              description: "There was an error during playback. Please try again.",
              variant: "destructive"
            });
          }}
          disableSeekBackward={true}
        />
        
        <div className={`mt-4 ${isFullscreen ? 'hidden' : 'block'}`}>
          <Button 
            onClick={toggleFullscreen}
            variant="secondary" 
            className="bg-[#221F1F] hover:bg-[#564D4D]"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </Button>
          
          {contentData.description && (
            <div className="mt-4 max-w-3xl">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-400">{contentData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
