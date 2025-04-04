import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Navbar from '@/components/Navbar';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, {
        displayName: formData.displayName,
        email: formData.email,
      });
      
      if (response.ok) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Your new password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const response = await apiRequest('POST', `/api/auth/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      if (response.ok) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully changed.',
        });
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>; // Should never happen because of ProtectedRoute
  }

  return (
    <div className="bg-[#141414] min-h-screen text-gray-200">
      <Navbar />
      
      <main className="pt-24 pb-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">My Account</h1>
          
          <div className="flex flex-col md:flex-row items-start md:space-x-8 mb-8">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <div className="flex flex-col items-center">
                <Avatar className="h-28 w-28 rounded mb-4">
                  <AvatarImage 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"} 
                    alt={user.displayName || user.username}
                  />
                  <AvatarFallback className="text-2xl">{user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">{user.displayName || user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <p className="text-gray-400 mt-1 capitalize">Role: {user.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-[#221F1F] border border-gray-700">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card className="bg-[#221F1F] border-gray-700">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Update your account's profile information.
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleProfileUpdate}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="displayName" className="text-sm font-medium">
                            Display Name
                          </label>
                          <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="bg-[#141414] border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-[#141414] border-gray-700"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="bg-[#E50914] hover:bg-[#f40612] text-white"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card className="bg-[#221F1F] border-gray-700">
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription className="text-gray-400">
                        Ensure your account is using a secure password.
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handlePasswordChange}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="currentPassword" className="text-sm font-medium">
                            Current Password
                          </label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="bg-[#141414] border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                          </label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="bg-[#141414] border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                          </label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="bg-[#141414] border-gray-700"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="bg-[#E50914] hover:bg-[#f40612] text-white"
                        >
                          {isUpdating ? 'Updating...' : 'Change Password'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preferences">
                  <Card className="bg-[#221F1F] border-gray-700">
                    <CardHeader>
                      <CardTitle>Viewing Preferences</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage your viewing and notification preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Auto-Play Videos</span>
                        <div className="bg-[#E50914] w-12 h-6 rounded-full relative cursor-pointer">
                          <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Email Notifications</span>
                        <div className="bg-[#141414] border border-gray-600 w-12 h-6 rounded-full relative cursor-pointer">
                          <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full"></span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Video Quality (Auto)</span>
                        <div className="bg-[#E50914] w-12 h-6 rounded-full relative cursor-pointer">
                          <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-gray-400">
                        Preferences are automatically saved when changed.
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="mt-10">
            <Card className="bg-[#221F1F] border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle>Watch History</CardTitle>
                <CardDescription className="text-gray-400">
                  Recently watched content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-gray-400">
                  <p>No watch history available yet.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;