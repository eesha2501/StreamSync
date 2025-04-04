import type { Express, Request, Response } from "express";
import express, { NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES modules don't have __dirname, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { WebSocketServer, WebSocket } from 'ws';

// Extend WebSocket to add custom properties
interface SyncWebSocket extends WebSocket {
  videoId?: number;
  streamId?: number;
}
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
    if (req.session && user) {
      req.session.userId = user.id;
    }
    
    // Don't return password in response if it exists
    // Create a safe user object
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create a safe user object without password
    const userWithoutPassword = { 
      ...user,
      password: undefined 
    };
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
    const userWithoutPassword = { 
      ...user,
      password: undefined 
    };
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
    const userWithoutPassword = { 
      ...user,
      password: undefined 
    };
    res.status(200).json(userWithoutPassword);
  });
  
  // Video Routes
  app.get('/api/videos', async (req, res) => {
    const category = req.query.category as string | undefined;
    const isAdmin = req.query.isAdmin === 'true';
    const now = new Date();
    
    let videos;
    if (category) {
      videos = await storage.getVideosByCategory(category);
    } else {
      videos = await storage.getVideos();
    }
    
    // Filter videos based on visibility rules:
    // 1. If admin view, show all videos
    // 2. If regular user view, only show videos that are currently live
    if (!isAdmin) {
      videos = videos.filter(video => {
        // For streams with scheduled times
        if (video.startTime && video.endTime) {
          return video.startTime <= now && now <= video.endTime && video.isLive;
        }
        // For videos that are always live (no specific schedule)
        return video.isLive === true;
      });
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
    
    // Check if user is admin or if the video is currently live
    const isAdmin = req.query.isAdmin === 'true';
    if (!isAdmin) {
      const now = new Date();
      
      // Check if the video is currently live
      const isVideoLive = video.isLive && 
        (!video.startTime || (video.startTime && video.startTime <= now)) && 
        (!video.endTime || (video.endTime && now <= video.endTime));
      
      if (!isVideoLive) {
        return res.status(404).json({ message: "Video not found or not currently available" });
      }
    }
    
    res.status(200).json(video);
  });
  
  app.post('/api/videos', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const validation = validateRequest(insertVideoSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const video = await storage.createVideo({
        ...validation.data,
        userId: req.session.userId
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
    if (req.session?.userId && video.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
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
  
  // Toggle video visibility (make it live or not)
  app.put('/api/videos/:id/toggle-visibility', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if user has permission (admins can toggle any video, channel admins only their own)
    if (req.session?.userId && video.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to modify this video" });
      }
    }
    
    try {
      // Toggle the isLive status
      const updatedVideo = await storage.updateVideo(id, { 
        isLive: !video.isLive,
        // If making it live again and there's no valid endTime, set it to a future date
        endTime: (!video.isLive && (!video.endTime || new Date(video.endTime) < new Date())) ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000) : // 24 hours from now
          video.endTime
      });
      
      if (!updatedVideo) {
        return res.status(500).json({ message: "Failed to update video visibility" });
      }
      
      res.status(200).json({
        message: updatedVideo.isLive ? "Video is now live" : "Video is now offline",
        video: updatedVideo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update video visibility" });
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
    if (req.session?.userId && video.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
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
    const isAdmin = req.query.isAdmin === 'true';
    const now = new Date();
    
    // Get all streams
    const liveStreams = await storage.getLiveStreams();
    
    // Filter streams based on visibility rules if not admin
    if (!isAdmin) {
      // Only return streams that are currently live
      const filteredStreams = liveStreams.filter(stream => 
        stream.isLive === true && 
        stream.startTime <= now && 
        (stream.endTime === null || now <= stream.endTime)
      );
      return res.status(200).json(filteredStreams);
    }
    
    res.status(200).json(liveStreams);
  });
  
  app.get('/api/streams/upcoming', async (req, res) => {
    const isAdmin = req.query.isAdmin === 'true';
    const now = new Date();
    
    // Get all upcoming streams
    const upcomingStreams = await storage.getUpcomingStreams();
    
    // Filter streams based on visibility rules if not admin
    if (!isAdmin) {
      // Only return streams that are scheduled to be live in the future
      const filteredStreams = upcomingStreams.filter(stream => 
        stream.isLive === true
      );
      return res.status(200).json(filteredStreams);
    }
    
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
    
    // Check if user is admin or if the stream is currently live
    const isAdmin = req.query.isAdmin === 'true';
    if (!isAdmin) {
      const now = new Date();
      
      // Check if the stream is currently live
      const isStreamLive = stream.isLive && 
        (!stream.startTime || (stream.startTime && stream.startTime <= now)) && 
        (!stream.endTime || (stream.endTime && now <= stream.endTime));
      
      if (!isStreamLive) {
        return res.status(404).json({ message: "Stream not found or not currently available" });
      }
    }
    
    res.status(200).json(stream);
  });
  
  app.post('/api/streams', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const validation = validateRequest(insertStreamSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }
    
    try {
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const stream = await storage.createStream({
        ...validation.data,
        userId: req.session.userId
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
    if (req.session?.userId && stream.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
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
  
  // Toggle stream visibility (make it live or not)
  app.put('/api/streams/:id/toggle-visibility', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const stream = await storage.getStream(id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    
    // Check if user has permission (admins can toggle any stream, channel admins only their own)
    if (req.session?.userId && stream.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to modify this stream" });
      }
    }
    
    try {
      // Toggle the isLive status
      const updatedStream = await storage.updateStream(id, { 
        isLive: !stream.isLive,
        // If making it live again and there's no valid endTime, set it to a future date
        endTime: (!stream.isLive && (!stream.endTime || new Date(stream.endTime) < new Date())) ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000) : // 24 hours from now
          stream.endTime
      });
      
      if (!updatedStream) {
        return res.status(500).json({ message: "Failed to update stream visibility" });
      }
      
      res.status(200).json({
        message: updatedStream.isLive ? "Stream is now live" : "Stream is now offline",
        stream: updatedStream
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update stream visibility" });
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
    if (req.session?.userId && stream.userId !== req.session.userId) {
      const user = await storage.getUser(req.session.userId);
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
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const session = await storage.createViewerSession({
        ...validation.data,
        userId: req.session.userId,
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
    if (!req.session?.userId || session.userId !== req.session.userId) {
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
    if (!req.session?.userId || session.userId !== req.session.userId) {
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
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const notifications = await storage.getNotifications(req.session.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  app.get('/api/notifications/unread', requireAuth, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const unreadNotifications = await storage.getUnreadNotifications(req.session.userId);
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
    
    if (!req.session?.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const notification = await storage.getNotifications(req.session.userId)
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
    
    if (!req.session?.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const notification = await storage.getNotifications(req.session.userId)
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

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });

  // Configure multer upload
  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: function (req, file, cb) {
      // Accept videos, images, and other common files
      const filetypes = /jpeg|jpg|png|gif|mp4|webm|mov|avi|wmv/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      
      cb(new Error('Only media files are allowed'));
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // File upload routes
  app.post('/api/upload/video', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Return the file path
      const filePath = `/uploads/${req.file.filename}`;
      res.status(200).json({ 
        message: 'File uploaded successfully',
        filePath: filePath,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Profile image upload
  app.post('/api/upload/profile-image', requireAuth, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      if (!req.session?.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get the file path
      const filePath = `/uploads/${req.file.filename}`;
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.session.userId, {
        photoURL: filePath
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user without password
      const userWithoutPassword = {
        ...updatedUser,
        password: undefined
      };
      
      res.status(200).json({
        message: 'Profile image updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile image' });
    }
  });

  // Thumbnail upload
  app.post('/api/upload/thumbnail', requireAuth, requireRole([UserRole.ADMIN, UserRole.CHANNEL_ADMIN]), upload.single('thumbnail'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Return the file path
      const filePath = `/uploads/${req.file.filename}`;
      res.status(200).json({ 
        message: 'Thumbnail uploaded successfully',
        filePath: filePath,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload thumbnail' });
    }
  });

  // Get watch history
  app.get('/api/watch-history', requireAuth, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      // Get all completed viewer sessions for the user
      const sessions = await storage.getActiveViewerSessions();
      const userSessions = sessions.filter(session => session.userId === req.session?.userId);
      
      // Get video and stream details
      const history = await Promise.all(userSessions.map(async (session) => {
        let mediaContent;
        
        if (session.videoId) {
          mediaContent = await storage.getVideo(session.videoId);
        } else if (session.streamId) {
          mediaContent = await storage.getStream(session.streamId);
        }
        
        if (!mediaContent) return null;
        
        return {
          sessionId: session.id,
          sessionStarted: session.startedAt,
          sessionEnded: session.endedAt,
          progress: session.currentTimestamp,
          isActive: session.isActive,
          media: mediaContent
        };
      }));
      
      // Filter out null entries
      const validHistory = history.filter(item => item !== null);
      
      res.status(200).json(validHistory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get watch history' });
    }
  });

  // Add user management endpoint for Admin
  app.get('/api/users', requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      // This endpoint requires implementation in storage.ts
      // For now, we'll return all users without password
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      
      res.status(200).json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get users' });
    }
  });

  // Search API (for search functionality)
  app.get('/api/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    try {
      // Search in videos
      const videos = await storage.getVideos();
      const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) || 
        (video.description && video.description.toLowerCase().includes(query.toLowerCase())) ||
        (video.category && video.category.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Search in streams
      const streams = await storage.getLiveStreams();
      const upcomingStreams = await storage.getUpcomingStreams();
      const allStreams = [...streams, ...upcomingStreams];
      
      const filteredStreams = allStreams.filter(stream => 
        stream.title.toLowerCase().includes(query.toLowerCase()) || 
        (stream.description && stream.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      res.status(200).json({
        videos: filteredVideos,
        streams: filteredStreams
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to search content' });
    }
  });

  // Set up WebSocket server for synchronized video playback
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: SyncWebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Send initial heartbeat
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() }));
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'SYNC') {
          // Broadcast sync message to all clients watching the same content
          wss.clients.forEach((client: SyncWebSocket) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              // Only send to clients watching the same content
              if ((data.videoId && client.videoId === data.videoId) || 
                  (data.streamId && client.streamId === data.streamId)) {
                client.send(JSON.stringify({
                  type: 'SYNC',
                  currentTime: data.currentTime,
                  playing: data.playing,
                  userId: data.userId,
                  videoId: data.videoId,
                  streamId: data.streamId,
                  timestamp: Date.now()
                }));
              }
            }
          });
          
          // Save the content ID with the websocket for later filtering
          if (data.videoId) ws.videoId = data.videoId;
          if (data.streamId) ws.streamId = data.streamId;
          
          // Update the viewer session in the database
          if (data.sessionId) {
            await storage.updateViewerSession(data.sessionId, {
              currentTimestamp: data.currentTime,
              isActive: true
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle WebSocket close
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
