import { useLocation } from 'wouter';
import { useState } from 'react';

interface VideoCardProps {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  isLive?: boolean;
  isUpcoming?: boolean;
  viewerCount?: number;
  streamDate?: string;
  year?: string;
  matchPercentage?: number;
  type: 'video' | 'stream';
}

const VideoCard = ({
  id,
  title,
  description,
  thumbnailUrl,
  isLive = false,
  isUpcoming = false,
  viewerCount,
  streamDate,
  year,
  matchPercentage,
  type
}: VideoCardProps) => {
  const [, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (type === 'video') {
      navigate(`/watch/video/${id}`);
    } else if (isLive) {
      navigate(`/watch/stream/${id}`);
    } else if (isUpcoming) {
      navigate(`/details/stream/${id}`);
    }
  };

  return (
    <div 
      className="relative min-w-[250px] transition duration-300 transform hover:scale-105 cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"} 
          alt={title} 
          className="rounded-md w-full h-40 object-cover"
        />
        
        {isLive && (
          <div className="sync-badge">LIVE SYNC</div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-3">
          {isLive && viewerCount && (
            <div className="flex items-center mb-1">
              <span className="bg-[#E50914] text-white px-1 py-0.5 text-xs font-bold mr-2">LIVE</span>
              <span className="text-xs text-[#46D369]">
                {viewerCount >= 1000 
                  ? `${(viewerCount / 1000).toFixed(0)}K viewers` 
                  : `${viewerCount} viewers`}
              </span>
            </div>
          )}
          
          {isUpcoming && streamDate && (
            <div className="flex items-center mb-1">
              <span className="bg-[#E87C03] text-white px-1 py-0.5 text-xs font-bold">{streamDate}</span>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="mt-2 font-medium truncate">{title}</h3>
      
      {description && (
        <p className="text-gray-400 text-sm truncate">{description}</p>
      )}
      
      {matchPercentage && (
        <div className="flex items-center mt-1">
          <span className="text-[#46D369] text-sm">{matchPercentage}% Match</span>
          {year && <span className="mx-2 text-xs text-gray-400">{year}</span>}
        </div>
      )}
      
      {isHovered && (
        <div className="absolute -bottom-2 left-0 right-0 bg-black bg-opacity-70 p-2 rounded-b-md transform translate-y-full">
          <div className="text-xs text-gray-300">
            {description || `Watch ${isLive ? 'live' : isUpcoming ? 'soon' : 'now'}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
