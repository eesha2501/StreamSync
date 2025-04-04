import { apiRequest } from './queryClient';

export type VideoSession = {
  id: number;
  videoId?: number;
  streamId?: number;
  currentTimestamp: number;
  isActive: boolean;
};

// Create a new viewer session
export const createViewerSession = async (
  videoId?: number,
  streamId?: number
): Promise<VideoSession> => {
  try {
    const response = await apiRequest('POST', '/api/viewer-sessions', {
      videoId,
      streamId,
      currentTimestamp: 0,
      isActive: true,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating viewer session:', error);
    throw error;
  }
};

// Update the current timestamp for a viewer session
export const syncViewerSession = async (
  sessionId: number,
  currentTimestamp: number
): Promise<VideoSession> => {
  try {
    const response = await apiRequest('PUT', `/api/viewer-sessions/${sessionId}/sync`, {
      currentTimestamp
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing viewer session:', error);
    throw error;
  }
};

// End a viewer session
export const endViewerSession = async (sessionId: number): Promise<VideoSession> => {
  try {
    const response = await apiRequest('PUT', `/api/viewer-sessions/${sessionId}/end`, {});
    
    return await response.json();
  } catch (error) {
    console.error('Error ending viewer session:', error);
    throw error;
  }
};

// Setup synchronization using polling instead of WebSockets
export const setupSyncSocket = (
  sessionId: number,
  onSync: (timestamp: number) => void,
  onError: (error: Event) => void
): { close: () => void } => {
  console.log('Setting up polling sync (WebSocket functionality disabled)');
  
  // Use polling as a substitute for real-time WebSocket updates
  let isActive = true;
  const pollInterval = 5000; // Poll every 5 seconds
  
  const pollForUpdates = async () => {
    if (!isActive) return;
    
    try {
      // Get active sessions for this video/stream
      const response = await fetch('/api/viewer-sessions/active');
      if (!response.ok) throw new Error('Failed to fetch active sessions');
      
      const sessions = await response.json();
      
      // Find any sessions with more recent timestamps
      const otherSessions = sessions.filter((s: any) => s.id !== sessionId);
      if (otherSessions.length > 0) {
        // Find the most advanced timestamp
        const mostAdvanced = otherSessions.reduce((max: any, session: any) => {
          return session.currentTimestamp > max.currentTimestamp ? session : max;
        }, otherSessions[0]);
        
        // If it's ahead of our current time, update
        onSync(mostAdvanced.currentTimestamp);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
      // Call the error handler but convert to Event-like object
      const errorEvent = new Event('error');
      onError(errorEvent);
    }
    
    // Continue polling
    if (isActive) {
      setTimeout(pollForUpdates, pollInterval);
    }
  };
  
  // Start polling
  setTimeout(pollForUpdates, pollInterval);
  
  // Return an object with a close method to stop polling
  return {
    close: () => {
      isActive = false;
      console.log('Polling sync stopped');
    }
  };
};

// Helper function to format video duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
