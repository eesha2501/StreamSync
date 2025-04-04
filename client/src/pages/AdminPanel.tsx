import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { UserRole } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for analytics charts - in a real app this would come from an API
const analyticsData = [
  { name: 'Mon', viewers: 4000, streams: 24 },
  { name: 'Tue', viewers: 3000, streams: 13 },
  { name: 'Wed', viewers: 5000, streams: 30 },
  { name: 'Thu', viewers: 2780, streams: 19 },
  { name: 'Fri', viewers: 8890, streams: 40 },
  { name: 'Sat', viewers: 12390, streams: 81 },
  { name: 'Sun', viewers: 7800, streams: 59 },
];

const AdminPanel = () => {
  const { user, isLoading, isAdmin, isChannelAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check if user has admin privileges
  useEffect(() => {
    if (!isLoading && !user) {
      // Not logged in
      navigate('/login');
      return;
    }
    
    if (!isLoading && user && !isAdmin && !isChannelAdmin) {
      // Not an admin or channel admin
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isLoading, isAdmin, isChannelAdmin, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
      </div>
    );
  }
  
  if (!user || (!isAdmin && !isChannelAdmin)) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">Analytics & Insights</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#1F1F1F] border-0">
                  <CardHeader>
                    <CardTitle>Viewer Engagement</CardTitle>
                    <CardDescription className="text-gray-400">Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#B3B3B3" />
                          <YAxis stroke="#B3B3B3" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141414', borderColor: '#333' }}
                            labelStyle={{ color: 'white' }}
                          />
                          <Bar dataKey="viewers" fill="#E50914" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1F1F1F] border-0">
                  <CardHeader>
                    <CardTitle>Stream Count</CardTitle>
                    <CardDescription className="text-gray-400">Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#B3B3B3" />
                          <YAxis stroke="#B3B3B3" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141414', borderColor: '#333' }}
                            labelStyle={{ color: 'white' }}
                          />
                          <Bar dataKey="streams" fill="#46D369" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-[#1F1F1F] border-0">
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription className="text-gray-400">Monthly overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#221F1F] border-0">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">New Users</p>
                          <h3 className="text-3xl font-bold mt-2">+24%</h3>
                          <p className="text-[#46D369] text-xs mt-1">↑ 12% from last month</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#221F1F] border-0">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Watch Time</p>
                          <h3 className="text-3xl font-bold mt-2">+18%</h3>
                          <p className="text-[#46D369] text-xs mt-1">↑ 5% from last month</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#221F1F] border-0">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Content Added</p>
                          <h3 className="text-3xl font-bold mt-2">+32</h3>
                          <p className="text-[#46D369] text-xs mt-1">↑ 8 more than last month</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#221F1F] border-0">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Sync Sessions</p>
                          <h3 className="text-3xl font-bold mt-2">+56%</h3>
                          <p className="text-[#46D369] text-xs mt-1">↑ 23% from last month</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">Content Management</h2>
                <Button className="bg-[#E50914] hover:bg-opacity-80">
                  Add New Content
                </Button>
              </div>
              
              <Card className="bg-[#1F1F1F] border-0 mb-8">
                <CardHeader>
                  <CardTitle>Live & Scheduled Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#333]">
                          <th className="text-left p-3">Title</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Scheduled Time</th>
                          <th className="text-left p-3">Viewers</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#333]">
                          <td className="p-3">Stranger Things S4E8</td>
                          <td className="p-3">
                            <span className="bg-[#E50914] text-white px-2 py-1 text-xs rounded">LIVE</span>
                          </td>
                          <td className="p-3">Now</td>
                          <td className="p-3">34.2K</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                End
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-[#333]">
                          <td className="p-3">NBA Finals Game 6</td>
                          <td className="p-3">
                            <span className="bg-[#E87C03] text-white px-2 py-1 text-xs rounded">SCHEDULED</span>
                          </td>
                          <td className="p-3">Today, 22:30</td>
                          <td className="p-3">--</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3">Dark Matter</td>
                          <td className="p-3">
                            <span className="bg-[#E87C03] text-white px-2 py-1 text-xs rounded">SCHEDULED</span>
                          </td>
                          <td className="p-3">Tomorrow, 20:00</td>
                          <td className="p-3">--</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1F1F1F] border-0">
                <CardHeader>
                  <CardTitle>Video Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#333]">
                          <th className="text-left p-3">Title</th>
                          <th className="text-left p-3">Category</th>
                          <th className="text-left p-3">Duration</th>
                          <th className="text-left p-3">Added Date</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#333]">
                          <td className="p-3">Interstellar Voyages</td>
                          <td className="p-3">Sci-Fi</td>
                          <td className="p-3">2:00:00</td>
                          <td className="p-3">2023-01-15</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800 text-[#E50914]">
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-[#333]">
                          <td className="p-3">The Last Detective</td>
                          <td className="p-3">Crime Drama</td>
                          <td className="p-3">1:30:00</td>
                          <td className="p-3">2022-11-03</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800 text-[#E50914]">
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3">Office Laughs</td>
                          <td className="p-3">Comedy</td>
                          <td className="p-3">1:15:00</td>
                          <td className="p-3">2021-09-17</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-gray-700 hover:bg-gray-800 text-[#E50914]">
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
