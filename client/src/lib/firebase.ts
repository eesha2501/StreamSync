import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Log current environment for debugging
console.log("Firebase environment check:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Not set",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Set" : "Not set",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Set" : "Not set",
  domain: window.location.hostname
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase - safely handle possible duplicate initialization
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Continue with the app even if Firebase fails
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;
