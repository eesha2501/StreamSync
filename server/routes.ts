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
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Role-based authorization middleware
function requireRole(roles: UserRole[]) {
  return async (req: Request, res: Response, next: () => void) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !roles.includes(user.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
}

import type { Session } from 'express-session';

// Extend Express Request type to include session
declare module 'express' {
  interface Request {
    session: Session & {
      userId?: number;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    const validation = validateRequest(insertUserSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
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
    try {
      const user = await storage.createUser(validation.data);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post('/api/auth/firebase-login', async (req, res) => {
    const { firebaseUid, email, displayName, photoURL } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "Firebase UID and email are required" });
    }
    
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
    
    // Set user session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });
  
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
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
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });
  
  // Video Routes
  app.get('/api/videos', async (req, res) => {
    const category = req.query.category as string | undefined;
    
    let videos;
    if (category) {
      videos = await storage.getVideosByCategory(category);
    } else {
      videos = await storage.getVideos();
    }
    
    res.status(200).json(videos);
  });
  
  app.get('/api/videos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.status(200).json(video);
  });
  
  app.post('/api/videos', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const validation = validateRequest(insertVideoSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      const video = await storage.createVideo({
        ...validation.data,
        userId: req.session!.userId
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  
  app.put('/api/videos/:id', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const validation = validateRequest(insertVideoSchema.partial(), req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if user has permission
    if (video.userId !== req.session!.userId) {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to edit this video" });
      }
    }
    
    try {
      const updatedVideo = await storage.updateVideo(id, validation.data);
      res.status(200).json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  
  app.delete('/api/videos/:id', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if user has permission
    if (video.userId !== req.session!.userId) {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to delete this video" });
      }
    }
    
    try {
      const success = await storage.deleteVideo(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete video" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  
  // Stream Routes
  app.get('/api/streams/live', async (req, res) => {
    const liveStreams = await storage.getLiveStreams();
    res.status(200).json(liveStreams);
  });
  
  app.get('/api/streams/upcoming', async (req, res) => {
    const upcomingStreams = await storage.getUpcomingStreams();
    res.status(200).json(upcomingStreams);
  });
  
  app.get('/api/streams/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const stream = await storage.getStream(id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    
    res.status(200).json(stream);
  });
  
  app.post('/api/streams', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const validation = validateRequest(insertStreamSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      const stream = await storage.createStream({
        ...validation.data,
        userId: req.session!.userId
      });
      res.status(201).json(stream);
    } catch (error) {
      res.status(500).json({ message: "Failed to create stream" });
    }
  });
  
  app.put('/api/streams/:id', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const validation = validateRequest(insertStreamSchema.partial(), req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    const stream = await storage.getStream(id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    
    // Check if user has permission
    if (stream.userId !== req.session!.userId) {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to edit this stream" });
      }
    }
    
    try {
      const updatedStream = await storage.updateStream(id, validation.data);
      res.status(200).json(updatedStream);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stream" });
    }
  });
  
  app.delete('/api/streams/:id', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const stream = await storage.getStream(id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    
    // Check if user has permission
    if (stream.userId !== req.session!.userId) {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to delete this stream" });
      }
    }
    
    try {
      const success = await storage.deleteStream(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete stream" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stream" });
    }
  });
  
  // Viewer Session Routes
  app.post('/api/viewer-sessions', requireAuth, async (req, res) => {
    const validation = validateRequest(insertViewerSessionSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      const session = await storage.createViewerSession({
        ...validation.data,
        userId: req.session!.userId,
        isActive: true
      });
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create viewer session" });
    }
  });
  
  app.put('/api/viewer-sessions/:id/sync', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const { currentTimestamp } = req.body;
    if (currentTimestamp === undefined) {
      return res.status(400).json({ message: "Current timestamp is required" });
    }
    
    const session = await storage.getViewerSession(id);
    if (!session) {
      return res.status(404).json({ message: "Viewer session not found" });
    }
    
    // Check if this is the user's session
    if (session.userId !== req.session!.userId) {
      return res.status(403).json({ message: "You don't have permission to update this session" });
    }
    
    try {
      const updatedSession = await storage.updateViewerSession(id, { 
        currentTimestamp: Number(currentTimestamp),
        isActive: true
      });
      res.status(200).json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update viewer session" });
    }
  });
  
  app.put('/api/viewer-sessions/:id/end', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const session = await storage.getViewerSession(id);
    if (!session) {
      return res.status(404).json({ message: "Viewer session not found" });
    }
    
    // Check if this is the user's session
    if (session.userId !== req.session!.userId) {
      return res.status(403).json({ message: "You don't have permission to end this session" });
    }
    
    try {
      const endedSession = await storage.endViewerSession(id);
      res.status(200).json(endedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to end viewer session" });
    }
  });
  
  app.get('/api/viewer-sessions/active', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const videoId = req.query.videoId ? parseInt(req.query.videoId as string) : undefined;
    const streamId = req.query.streamId ? parseInt(req.query.streamId as string) : undefined;
    
    try {
      const activeSessions = await storage.getActiveViewerSessions(videoId, streamId);
      res.status(200).json(activeSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active viewer sessions" });
    }
  });
  
  // Notification Routes
  app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.session!.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  app.get('/api/notifications/unread', requireAuth, async (req, res) => {
    try {
      const unreadNotifications = await storage.getUnreadNotifications(req.session!.userId);
      res.status(200).json(unreadNotifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread notifications" });
    }
  });
  
  app.post('/api/notifications', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const validation = validateRequest(insertNotificationSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      const notification = await storage.createNotification(validation.data);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const notification = await storage.getNotifications(req.session!.userId)
      .then(notifications => notifications.find(n => n.id === id));
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    try {
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const notification = await storage.getNotifications(req.session!.userId)
      .then(notifications => notifications.find(n => n.id === id));
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    try {
      const success = await storage.deleteNotification(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete notification" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  return httpServer;
}
