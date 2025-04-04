import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Calendar, Users, Settings, PenSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { type Stream, type ViewerSession, UserRole, type Video } from '@shared/schema';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'viewers' | 'content' | 'chat'>('viewers');
  
  // Fetch active viewer sessions
  const { data: viewerSessions } = useQuery<ViewerSession[]>({
    queryKey: ['/api/viewer-sessions/active'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch scheduled streams
  const { data: upcomingStreams } = useQuery<Stream[]>({
    queryKey: ['/api/streams/upcoming'],
  });
  
  // Fetch live streams for analytics
  const { data: liveStreams } = useQuery<Stream[]>({
    queryKey: ['/api/streams/live'],
  });
  
  // Mock chat data - in a real app this would come from a WebSocket or API
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'JohnDoe', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&q=80', message: 'This episode is amazing! Can\'t believe what happened to Eleven!', time: '2 min ago' },
    { id: 2, user: 'SarahK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&q=80', message: 'When is the next episode scheduled?', time: '5 min ago' },
    { id: 3, user: 'MikeT', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&q=80', message: 'Does anyone know if there will be a season 5?', time: 'Just now' },
  ]);
  
  const [chatInput, setChatInput] = useState('');
  
  const totalViewers = viewerSessions?.length || 0;
  const scheduledContent = upcomingStreams?.length || 0;
  
  const handleUploadContent = () => {
    toast({
      title: "Upload Content",
      description: "Content upload interface would open here.",
    });
  };
  
  const handleScheduleStream = () => {
    toast({
      title: "Schedule Stream",
      description: "Stream scheduling form would open here.",
    });
  };
  
  const handleManageAccess = () => {
    toast({
      title: "Access Management",
      description: "User access management interface would open here.",
    });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // In a real app, this would send via websocket/API
    const newMessage = {
      id: chatMessages.length + 1,
      user: user?.username || 'Admin',
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&q=80',
      message: chatInput,
      time: 'Just now'
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the chat.",
    });
  };
  
  const handleMuteUser = (userId: number) => {
    toast({
      title: "User Muted",
      description: `User with ID ${userId} has been muted.`,
    });
  };
  
  const handleDeleteMessage = (messageId: number) => {
    setChatMessages(chatMessages.filter(msg => msg.id !== messageId));
    toast({
      title: "Message Deleted",
      description: "The message has been removed from the chat.",
    });
  };
  
  const handleBanUser = (userId: number) => {
    toast({
      title: "User Banned",
      description: `User with ID ${userId} has been banned.`,
      variant: "destructive"
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h2>
        <div>
          <span className="text-gray-400 mr-2">Role:</span>
          <span className="bg-[#E50914] px-3 py-1 rounded text-sm">{user?.role || 'Admin'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1F1F1F] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Active Viewers</span>
              <span className="text-2xl font-bold">{totalViewers}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-[#141414] rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                {totalViewers > 0 
                  ? "Real-time viewer data available" 
                  : "No active viewers at the moment"}
              </span>
            </div>
            <div className="mt-3 text-sm text-[#46D369]">
              <span className="inline-block transform rotate-45">↗</span> 24% from yesterday
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1F1F1F] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Scheduled Content</span>
              <span className="text-2xl font-bold">{scheduledContent}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {upcomingStreams && upcomingStreams.length > 0 ? (
                upcomingStreams.slice(0, 3).map((stream) => (
                  <div key={stream.id} className="flex justify-between py-2 border-b border-[#221F1F]">
                    <span className="text-sm truncate">{stream.title}</span>
                    <span className="text-xs bg-[#E87C03] bg-opacity-30 text-[#E87C03] px-2 py-1 rounded">
                      {new Date(stream.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-gray-400 text-sm">No scheduled content found</div>
              )}
            </ScrollArea>
            <Button 
              variant="secondary" 
              className="mt-3 w-full py-2 bg-[#221F1F] hover:bg-[#564D4D] transition rounded text-sm"
              onClick={() => setSelectedTab('content')}
            >
              Manage Schedule
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1F1F1F] border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Content Management</span>
              <Settings className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full py-2 bg-[#E50914] hover:bg-opacity-80 transition rounded flex items-center justify-center"
                onClick={handleUploadContent}
              >
                <Upload className="h-4 w-4 mr-2" /> Upload New Content
              </Button>
              <Button 
                variant="secondary"
                className="w-full py-2 bg-[#221F1F] hover:bg-[#564D4D] transition rounded flex items-center justify-center"
                onClick={handleScheduleStream}
              >
                <Calendar className="h-4 w-4 mr-2" /> Schedule Stream
              </Button>
              <Button 
                variant="secondary"
                className="w-full py-2 bg-[#221F1F] hover:bg-[#564D4D] transition rounded flex items-center justify-center"
                onClick={handleManageAccess}
              >
                <Users className="h-4 w-4 mr-2" /> Manage Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-[#1F1F1F] border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Live Chat Moderation</span>
            <Button 
              variant="secondary" 
              className="bg-[#221F1F] hover:bg-[#564D4D] transition px-3 py-1 rounded text-sm"
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 mb-4">
            {chatMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3 py-2 border-b border-[#221F1F]">
                <img 
                  src={message.avatar} 
                  alt={message.user} 
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{message.user}</span>
                    <span className="text-xs text-gray-400">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-400">{message.message}</p>
                  <div className="flex space-x-2 mt-1">
                    <button 
                      className="text-xs text-gray-400 hover:text-white"
                      onClick={() => handleMuteUser(message.id)}
                    >
                      Mute
                    </button>
                    <button 
                      className="text-xs text-gray-400 hover:text-white"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="text-xs text-gray-400 hover:text-white"
                      onClick={() => handleBanUser(message.id)}
                    >
                      Ban
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          
          <form className="flex" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Send a message..." 
              className="flex-1 bg-[#221F1F] text-white px-4 py-2 rounded-l border-none focus:outline-none"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <Button 
              type="submit" 
              className="bg-[#E50914] px-4 py-2 rounded-r hover:bg-opacity-80 transition"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
