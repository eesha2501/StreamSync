import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { signOutUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { user, isAdmin, isChannelAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll event for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/auth');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const navbarClass = isScrolled
    ? "fixed w-full z-50 transition-all duration-300 bg-[#141414]"
    : "fixed w-full z-50 transition-all duration-300 bg-gradient-to-b from-[rgba(0,0,0,0.7)] to-transparent";

  return (
    <header className={navbarClass}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-[#E50914] text-2xl font-bold mr-8">StreamSync</a>
          </Link>
          
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              <Menu />
            </Button>
          ) : (
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className="text-white hover:text-gray-300">Home</a>
              </Link>
              <Link href="/tv-shows">
                <a className="text-gray-400 hover:text-white">TV Shows</a>
              </Link>
              <Link href="/movies">
                <a className="text-gray-400 hover:text-white">Movies</a>
              </Link>
              <Link href="/new">
                <a className="text-gray-400 hover:text-white">New & Popular</a>
              </Link>
              <Link href="/my-list">
                <a className="text-gray-400 hover:text-white">My List</a>
              </Link>
              {(isAdmin || isChannelAdmin) && (
                <Link href="/admin">
                  <a className="text-gray-400 hover:text-white">Admin</a>
                </Link>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {!isMobile && (
            <div className="relative hidden md:block">
              <Input 
                type="text" 
                placeholder="Search" 
                className="bg-black bg-opacity-60 text-white px-4 py-1 rounded border border-white border-opacity-20 focus:outline-none focus:border-white" 
              />
              <Search className="absolute right-3 top-2 text-gray-400 h-4 w-4" />
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-sm">
                  <Avatar className="h-8 w-8 rounded">
                    <AvatarImage 
                      src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"} 
                      alt={user.displayName || user.username}
                    />
                    <AvatarFallback className="rounded">{user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#221F1F]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user.displayName || user.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="text-gray-300 hover:bg-[#564D4D] hover:text-white"
                >
                  Account
                </DropdownMenuItem>
                {(isAdmin || isChannelAdmin) && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="text-gray-300 hover:bg-[#564D4D] hover:text-white"
                  >
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => navigate('/help')}
                  className="text-gray-300 hover:bg-[#564D4D] hover:text-white"
                >
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-[#564D4D] hover:text-white"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate('/auth')}
              className="bg-[#E50914] hover:bg-[#f40612] text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-[#141414] px-4 py-2">
          <nav className="flex flex-col space-y-3 pb-3">
            <Link href="/">
              <a className="text-white hover:text-gray-300 py-2">Home</a>
            </Link>
            <Link href="/tv-shows">
              <a className="text-gray-400 hover:text-white py-2">TV Shows</a>
            </Link>
            <Link href="/movies">
              <a className="text-gray-400 hover:text-white py-2">Movies</a>
            </Link>
            <Link href="/new">
              <a className="text-gray-400 hover:text-white py-2">New & Popular</a>
            </Link>
            <Link href="/my-list">
              <a className="text-gray-400 hover:text-white py-2">My List</a>
            </Link>
            {(isAdmin || isChannelAdmin) && (
              <Link href="/admin">
                <a className="text-gray-400 hover:text-white py-2">Admin</a>
              </Link>
            )}
            
            <div className="relative pt-2">
              <Input 
                type="text" 
                placeholder="Search" 
                className="bg-black bg-opacity-60 text-white px-4 py-1 rounded border border-white border-opacity-20 focus:outline-none focus:border-white w-full" 
              />
              <Search className="absolute right-3 top-1/2 text-gray-400 h-4 w-4" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
