import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  getRedirectResult
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

// Google provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google using popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    
    // Register or log in the user with our backend
    if (user) {
      await apiRequest("POST", "/api/auth/firebase-login", {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign in with Google using redirect (better for mobile)
export const signInWithGoogleRedirect = () => {
  signInWithRedirect(auth, googleProvider);
};

// Process redirect result
export const processRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Register or log in the user with our backend
      if (user) {
        await apiRequest("POST", "/api/auth/firebase-login", {
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        // Invalidate auth queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
      
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error processing redirect result:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    // Also sign out from our backend
    await apiRequest("POST", "/api/auth/logout", {});
    
    // Invalidate auth queries
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Admin login with username and password
export const adminLogin = async (username: string, password: string) => {
  try {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password
    });
    
    const user = await response.json();
    
    // Invalidate auth queries
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    
    return user;
  } catch (error) {
    console.error("Error logging in as admin:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include"
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to get current user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
