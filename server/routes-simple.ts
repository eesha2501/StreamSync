import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVideoSchema, 
  insertStreamSchema, 
  insertViewerSessionSchema, 
  insertNotificationSchema,
  UserRole
} from "@shared/schema";
import { z } from "zod";

// Helper to validate request body with Zod schema
function validateRequest<T>(schema: z.ZodType<T>, data: unknown): { success: true, data: T } | { success: false, error: string } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Invalid data format' };
  }
}

// Authorization middleware
function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Role-based authorization middleware
function requireRole(roles: UserRole[]) {
  return async (req: Request, res: Response, next: () => void) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !roles.includes(user.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    const validation = validateRequest(insertUserSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(validation.data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingUsername = await storage.getUserByUsername(validation.data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create new user
      const user = await storage.createUser(validation.data);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post('/api/auth/firebase-login', async (req, res) => {
    const { firebaseUid, email, displayName, photoURL } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Firebase UID and email are required" });
    }
    
    try {
      // Check if user exists by Firebase UID
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Check if user exists by email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Firebase UID
          user = await storage.updateUser(user.id, { firebaseUid });
        } else {
          // Create new user
          const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
          
          user = await storage.createUser({
            username,
            email,
            firebaseUid,
            displayName: displayName || username,
            photoURL,
            role: UserRole.USER
          });
        }
      }
      
      if (!user) {
        return res.status(500).json({ message: "Failed to create or retrieve user" });
      }
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(500).json({ message: "Failed to process login" });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to process login" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });
  
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Auth/me error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
  
  // Video Routes
  app.get('/api/videos', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let videos;
      if (category) {
        videos = await storage.getVideosByCategory(category);
      } else {
        videos = await storage.getVideos();
      }
      
      res.status(200).json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });
  
  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.status(200).json(video);
    } catch (error) {
      console.error("Get video error:", error);
      res.status(500).json({ message: "Failed to get video" });
    }
  });
  
  // Stream Routes
  app.get('/api/streams/live', async (req, res) => {
    try {
      const liveStreams = await storage.getLiveStreams();
      res.status(200).json(liveStreams);
    } catch (error) {
      console.error("Get live streams error:", error);
      res.status(500).json({ message: "Failed to get live streams" });
    }
  });
  
  app.get('/api/streams/upcoming', async (req, res) => {
    try {
      const upcomingStreams = await storage.getUpcomingStreams();
      res.status(200).json(upcomingStreams);
    } catch (error) {
      console.error("Get upcoming streams error:", error);
      res.status(500).json({ message: "Failed to get upcoming streams" });
    }
  });
  
  // Add a simple health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  return httpServer;
}