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
    // Create a fake session if not authenticated
    // This allows the player to work without authentication
    const isAuthenticated = document.cookie.includes('connect.sid');
    
    if (!isAuthenticated) {
      console.log('Not authenticated, creating mock session');
      return {
        id: Math.floor(Math.random() * 10000),
        videoId,
        streamId,
        currentTimestamp: 0,
        isActive: true
      };
    }
    
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
    // Return a mock session on error to allow player to work
    return {
      id: Math.floor(Math.random() * 10000),
      videoId,
      streamId,
      currentTimestamp: 0,
      isActive: true
    };
  }
};

// Update the current timestamp for a viewer session
export const syncViewerSession = async (
  sessionId: number,
  currentTimestamp: number
): Promise<VideoSession> => {
  try {
    // Check if it's a mock session ID (created when not authenticated)
    if (sessionId > 9000) {
      return {
        id: sessionId,
        currentTimestamp,
        isActive: true
      };
    }
    
    const response = await apiRequest('PUT', `/api/viewer-sessions/${sessionId}/sync`, {
      currentTimestamp
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing viewer session:', error);
    // Return mock response to allow player to continue working
    return {
      id: sessionId,
      currentTimestamp,
      isActive: true
    };
  }
};

// End a viewer session
export const endViewerSession = async (sessionId: number): Promise<VideoSession> => {
  try {
    // Check if it's a mock session ID (created when not authenticated)
    if (sessionId > 9000) {
      return {
        id: sessionId,
        currentTimestamp: 0,
        isActive: false
      };
    }
    
    const response = await apiRequest('PUT', `/api/viewer-sessions/${sessionId}/end`, {});
    
    return await response.json();
  } catch (error) {
    console.error('Error ending viewer session:', error);
    // Return mock response
    return {
      id: sessionId,
      currentTimestamp: 0,
      isActive: false
    };
  }
};

// Custom WebSocket interface with close method
export interface SyncSocket {
  socket: WebSocket;
  close: () => void;
}

// Setup synchronization using WebSockets
export const setupSyncSocket = (
  sessionId: number,
  onSync: (timestamp: number) => void,
  onError: (error: Event) => void,
  videoId?: number,
  streamId?: number
): SyncSocket => {
  try {
    // Determine WebSocket URL based on current protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Setting up WebSocket connection to:', wsUrl);
    
    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);
    let isActive = true;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      
      // Register this session with the sync server
      socket.send(JSON.stringify({
        type: 'REGISTER',
        sessionId,
        videoId,
        streamId
      }));
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'SYNC' && data.currentTime) {
          onSync(data.currentTime);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Connection closed or error
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      isActive = false;
    });
    
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      onError(error);
      isActive = false;
    });
    
    // Return our custom SyncSocket object
    return {
      socket: socket,
      close: () => {
        isActive = false;
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
        console.log('WebSocket connection closed by client');
      }
    };
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    // Return a dummy SyncSocket that does nothing
    return {
      socket: {} as WebSocket,
      close: () => { console.log('Dummy socket closed'); }
    };
  }
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
