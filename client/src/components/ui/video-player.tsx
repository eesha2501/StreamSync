import { useRef, useEffect, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Progress } from '@/components/ui/progress';
import { 
  createViewerSession, 
  syncViewerSession, 
  endViewerSession,
  setupSyncSocket,
  type VideoSession,
  type SyncSocket
} from '@/lib/videoPlayer';
import { useToast } from '@/hooks/use-toast';

export interface VideoPlayerProps {
  videoId?: number;
  streamId?: number;
  videoUrl: string;
  isLive?: boolean;
  poster?: string;
  title?: string;
  onError?: (error: any) => void;
  autoplay?: boolean;
  controls?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  disableSeekBackward?: boolean;
}

export function VideoPlayer({
  videoId,
  streamId,
  videoUrl,
  isLive = false,
  poster,
  title,
  onError,
  autoplay = true,
  controls = true,
  fluid = true,
  responsive = true,
  disableSeekBackward = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const sessionRef = useRef<VideoSession | null>(null);
  const socketRef = useRef<any>(null); // Use any type to avoid TypeScript errors
  const lastSyncTimeRef = useRef<number>(0);
  const syncIntervalRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const { toast } = useToast();

  // Setup video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    
    // Initialize player
    const options = {
      autoplay,
      controls,
      fluid,
      responsive,
      preload: 'auto',
      playbackRates: [0.5, 1, 1.5, 2],
      poster: poster,
      sources: [{
        src: videoUrl,
        type: isLive ? 'application/x-mpegURL' : 'video/mp4'
      }]
    };
    
    playerRef.current = videojs(videoElement, options, function onPlayerReady() {
      console.log('Player ready');
    });

    // Create viewer session
    const initSession = async () => {
      try {
        const session = await createViewerSession(videoId, streamId);
        sessionRef.current = session;
        
        // Setup WebSocket for sync
        socketRef.current = setupSyncSocket(
          session.id,
          (timestamp) => {
            if (playerRef.current && !isSeekingRef.current) {
              const currentTime = playerRef.current.currentTime();
              // Only sync if we're more than 5 seconds behind
              if (timestamp > currentTime + 5) {
                playerRef.current.currentTime(timestamp);
              }
            }
          },
          (error) => {
            console.error('WebSocket error:', error);
            if (onError) onError(error);
          },
          videoId,
          streamId
        );
        
        // Set up sync interval
        syncIntervalRef.current = window.setInterval(() => {
          if (playerRef.current && sessionRef.current) {
            const currentTime = playerRef.current.currentTime();
            
            // Only sync if time has changed
            if (currentTime !== lastSyncTimeRef.current) {
              lastSyncTimeRef.current = currentTime;
              syncViewerSession(sessionRef.current.id, currentTime)
                .catch(err => console.error('Error syncing session:', err));
            }
          }
        }, 5000); // Sync every 5 seconds
      } catch (error) {
        console.error('Error initializing session:', error);
        if (onError) onError(error);
        toast({
          title: "Error",
          description: "Failed to initialize video session",
          variant: "destructive"
        });
      }
    };
    
    initSession();

    // Clean up
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      
      if (sessionRef.current) {
        endViewerSession(sessionRef.current.id)
          .catch(err => console.error('Error ending session:', err));
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl, videoId, streamId, isLive, poster, autoplay, controls, fluid, responsive, onError, toast]);

  // Handle progress and buffering
  useEffect(() => {
    if (!playerRef.current) return;
    
    const player = playerRef.current;
    
    const onProgress = () => {
      if (!player) return;
      
      const duration = player.duration();
      const currentTime = player.currentTime();
      
      if (duration && duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    };
    
    const onWaiting = () => {
      setBuffering(true);
    };
    
    const onCanPlay = () => {
      setBuffering(false);
    };
    
    const onSeeking = () => {
      isSeekingRef.current = true;
    };
    
    const onSeeked = () => {
      isSeekingRef.current = false;
      
      // Prevent seeking backwards if disableSeekBackward is true
      if (disableSeekBackward && player) {
        const currentTime = player.currentTime();
        const lastTime = lastSyncTimeRef.current;
        
        if (currentTime < lastTime) {
          player.currentTime(lastTime);
          toast({
            title: "Cannot rewind",
            description: "Rewinding is not allowed in this stream",
            variant: "destructive"
          });
        }
      }
    };
    
    player.on('timeupdate', onProgress);
    player.on('waiting', onWaiting);
    player.on('canplay', onCanPlay);
    player.on('seeking', onSeeking);
    player.on('seeked', onSeeked);
    
    return () => {
      if (player) {
        player.off('timeupdate', onProgress);
        player.off('waiting', onWaiting);
        player.off('canplay', onCanPlay);
        player.off('seeking', onSeeking);
        player.off('seeked', onSeeked);
      }
    };
  }, [disableSeekBackward, toast]);

  return (
    <div className="relative">
      {title && (
        <h2 className="text-xl font-bold mb-2">{title}</h2>
      )}
      
      <div className="relative">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-netflix"
          />
        </div>
        
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        )}
        
        {isLive && (
          <div className="absolute top-2 right-2 bg-netflix-red text-white px-2 py-1 text-xs font-bold rounded flex items-center">
            <span className="animate-pulse mr-1">●</span> LIVE
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <Progress value={progress} />
      </div>
    </div>
  );
}
