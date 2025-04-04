import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithGoogle, signInWithGoogleRedirect, adminLogin, processRedirectResult } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // If user is already logged in, redirect to home
  if (user) {
    navigate('/');
    return null;
  }
  
  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const user = await processRedirectResult();
        if (user) {
          navigate('/');
          toast({
            title: 'Login successful',
            description: 'You have been logged in with Google',
          });
        }
      } catch (error) {
        console.error('Error processing redirect:', error);
        toast({
          title: 'Login failed',
          description: 'There was an error processing your login',
          variant: 'destructive',
        });
      }
    };
    
    checkRedirectResult();
  }, [navigate, toast]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Try the redirect method instead of popup
      signInWithGoogleRedirect();
      // No need for navigation here as it will redirect to Google
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: 'Login failed',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Login failed',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await adminLogin(username, password);
      navigate('/');
      toast({
        title: 'Login successful',
        description: 'You have been logged in as an admin',
      });
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-[#E50914] text-4xl font-bold mb-2">StreamSync</h1>
          <p className="text-gray-400">Synchronized streaming experience</p>
        </div>
        
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user">User Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <Card className="border-0 bg-[#221F1F]">
              <CardHeader>
                <CardTitle>User Login</CardTitle>
                <CardDescription>
                  Sign in to access synchronized streaming content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full font-semibold border-gray-700 hover:bg-gray-800 space-x-2"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <FcGoogle className="h-5 w-5" />
                  <span>Sign in with Google</span>
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#221F1F] text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  <p>This is a demo application.</p>
                  <p>Click "Sign in with Google" to continue as a user.</p>
                  <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md text-left">
                    <p className="font-medium text-yellow-500 mb-1">Firebase Authorization Note:</p>
                    <p>If you see an "unauthorized domain" error, add your Replit domain to Firebase:</p>
                    <ol className="list-decimal ml-5 space-y-1 mt-1">
                      <li>Go to Firebase console</li>
                      <li>Select Authentication → Settings</li>
                      <li>Add your domain to "Authorized domains"</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card className="border-0 bg-[#221F1F]">
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Sign in with admin credentials to manage content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAdminLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#141414] border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#141414] border-gray-700"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#E50914] hover:bg-[#f40612]"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
                
                <div className="text-center text-sm text-gray-400 mt-4">
                  <p>Demo credentials:</p>
                  <p>Username: admin</p>
                  <p>Password: adminPassword</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
