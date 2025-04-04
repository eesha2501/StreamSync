import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type User, UserRole } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isChannelAdmin: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isChannelAdmin: false,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the current user from our backend
  const { data: backendUser, isLoading: isUserLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !backendUser) {
        // User is logged in with Firebase but not in our backend
        try {
          const response = await apiRequest('POST', '/api/auth/firebase-login', {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
          
          const user = await response.json();
          setUser(user);
        } catch (error) {
          console.error('Error logging in with Firebase:', error);
        }
      } else if (backendUser) {
        // User is already logged in with our backend
        setUser(backendUser);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [backendUser]);
  
  // Update loading state based on user query
  useEffect(() => {
    if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [isUserLoading]);
  
  // Check if user is admin or channel admin
  const isAdmin = user?.role === UserRole.ADMIN;
  const isChannelAdmin = user?.role === UserRole.CHANNEL_ADMIN;
  
  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isChannelAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
