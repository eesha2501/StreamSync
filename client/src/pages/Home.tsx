import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import LiveNowSection from '@/components/LiveNowSection';
import ComingSoonSection from '@/components/ComingSoonSection';
import RecommendedSection from '@/components/RecommendedSection';
import SyncFeatureSection from '@/components/SyncFeatureSection';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { type Stream } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const Home = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [featuredStreamId, setFeaturedStreamId] = useState<number | undefined>(undefined);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  // Fetch live streams to feature one in the hero section
  const { data: liveStreams } = useQuery<Stream[]>({
    queryKey: ['/api/streams/live'],
    enabled: !!user,
  });
  
  // Set a featured stream for the hero section
  useEffect(() => {
    if (liveStreams && liveStreams.length > 0) {
      // Use the stream with the highest viewer count as the featured stream
      const featured = liveStreams.reduce((prev, current) => {
        return (prev.viewerCount > current.viewerCount) ? prev : current;
      });
      
      setFeaturedStreamId(featured.id);
    }
  }, [liveStreams]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
      </div>
    );
  }
  
  if (!user) return null; // Will redirect in useEffect
  
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      
      <main>
        <HeroSection streamId={featuredStreamId} />
        
        <LiveNowSection />
        
        <ComingSoonSection />
        
        <RecommendedSection />
        
        <SyncFeatureSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
