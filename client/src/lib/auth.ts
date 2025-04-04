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
    console.log("Starting Google sign-in process");
    
    // Configure the Google provider with additional scopes if needed
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    // Set custom parameters for prompt and select_account
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("Google provider configured, initiating popup");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Popup completed successfully");
    
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    console.log("Token obtained:", token ? "Yes" : "No");
    
    const user = result.user;
    console.log("User info received:", user ? "Yes" : "No", user?.email);
    
    // Register or log in the user with our backend
    if (user) {
      console.log("Sending user data to backend");
      await apiRequest("POST", "/api/auth/firebase-login", {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      // Invalidate auth queries to refresh user data
      console.log("Invalidating auth queries");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Log more specific Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/popup-blocked':
          console.error("Popup was blocked by the browser");
          alert("Pop-up was blocked by the browser. Please allow pop-ups for this site to sign in with Google.");
          break;
        case 'auth/popup-closed-by-user':
          console.error("Popup was closed by the user");
          // This is a user action, no need for an alert
          break;
        case 'auth/unauthorized-domain':
          console.error("The domain is not authorized in Firebase");
          alert("This domain is not authorized in your Firebase project. Please add this domain to the authorized domains list in the Firebase console: Authentication → Settings → Authorized domains");
          // Fallback to regular login
          if (window.confirm("Would you like to sign in with username/password instead?")) {
            // Redirect to admin login page
            window.location.href = '/auth';
          }
          break;
        default:
          console.error("Other Firebase error");
          alert(`Authentication error: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// Sign in with Google using redirect (better for mobile)
export const signInWithGoogleRedirect = () => {
  try {
    signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Error initiating redirect sign-in:", error);
    
    if (error.code === 'auth/unauthorized-domain') {
      alert("This domain is not authorized in your Firebase project. Please add this domain to the authorized domains list in the Firebase console: Authentication → Settings → Authorized domains");
      // Fallback to regular login
      if (window.confirm("Would you like to sign in with username/password instead?")) {
        // Redirect to admin login page
        window.location.href = '/auth';
      }
    } else {
      alert(`Authentication error: ${error.message}`);
    }
  }
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
  } catch (error: any) {
    console.error("Error processing redirect result:", error);
    
    if (error.code) {
      switch (error.code) {
        case 'auth/unauthorized-domain':
          console.error("The domain is not authorized in Firebase");
          alert("This domain is not authorized in your Firebase project. Please add this domain to the authorized domains list in the Firebase console: Authentication → Settings → Authorized domains");
          // Fallback to regular login
          if (window.confirm("Would you like to sign in with username/password instead?")) {
            // Redirect to admin login page
            window.location.href = '/auth';
          }
          break;
        default:
          console.error("Other Firebase error");
          alert(`Authentication error: ${error.message}`);
      }
    }
    
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
