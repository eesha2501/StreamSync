import { FolderSync, Gauge, Bell } from 'lucide-react';

const SyncFeatureSection = () => {
  return (
    <section className="px-4 md:px-8 py-10 bg-[#221F1F] mt-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">StreamSync Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#E50914] rounded-full">
              <FolderSync className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time FolderSync</h3>
            <p className="text-gray-400">
              Join at any moment and instantly sync with the global timeline. Everyone sees the same content.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#E50914] rounded-full">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Adaptive Streaming</h3>
            <p className="text-gray-400">
              Enjoy smooth playback with our adaptive bitrate technology regardless of your internet speed.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#E50914] rounded-full">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Notifications</h3>
            <p className="text-gray-400">
              Get alerts about upcoming streams and never miss content that matches your interests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyncFeatureSection;
