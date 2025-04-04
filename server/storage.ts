import { 
  users, type User, type InsertUser,
  videos, type Video, type InsertVideo,
  streams, type Stream, type InsertStream,
  viewerSessions, type ViewerSession, type InsertViewerSession,
  notifications, type Notification, type InsertNotification,
  UserRole
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, gt, lte, desc } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import memorystore from 'memorystore';

// Initialize session stores
const PostgresSessionStore = connectPgSimple(session);
const MemoryStore = memorystore(session);

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;

  // Stream operations
  getStream(id: number): Promise<Stream | undefined>;
  getLiveStreams(): Promise<Stream[]>;
  getUpcomingStreams(): Promise<Stream[]>;
  createStream(stream: InsertStream): Promise<Stream>;
  updateStream(id: number, stream: Partial<InsertStream>): Promise<Stream | undefined>;
  updateViewerCount(id: number, viewerCount: number): Promise<Stream | undefined>;
  deleteStream(id: number): Promise<boolean>;

  // Viewer session operations
  getViewerSession(id: number): Promise<ViewerSession | undefined>;
  getActiveViewerSessions(videoId?: number, streamId?: number): Promise<ViewerSession[]>;
  createViewerSession(session: InsertViewerSession): Promise<ViewerSession>;
  updateViewerSession(id: number, session: Partial<InsertViewerSession>): Promise<ViewerSession | undefined>;
  endViewerSession(id: number): Promise<ViewerSession | undefined>;

  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private streams: Map<number, Stream>;
  private viewerSessions: Map<number, ViewerSession>;
  private notifications: Map<number, Notification>;
  private userIdCounter: number;
  private videoIdCounter: number;
  private streamIdCounter: number;
  private viewerSessionIdCounter: number;
  private notificationIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.streams = new Map();
    this.viewerSessions = new Map();
    this.notifications = new Map();
    this.userIdCounter = 1;
    this.videoIdCounter = 1;
    this.streamIdCounter = 1;
    this.viewerSessionIdCounter = 1;
    this.notificationIdCounter = 1;

    // Create the session store for in-memory storage
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Create a default admin user
    this.createUser({
      username: "admin",
      email: "admin@streamsync.com",
      password: "adminPassword", // In production, this would be hashed
      role: UserRole.ADMIN,
      displayName: "Admin User"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser as any, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData as any };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.category === category
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const now = new Date();
    const video: Video = {
      ...insertVideo as any,
      id,
      createdAt: now
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = { ...video, ...videoData as any };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  // Stream operations
  async getStream(id: number): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async getLiveStreams(): Promise<Stream[]> {
    return Array.from(this.streams.values()).filter(
      (stream) => stream.isLive
    );
  }

  async getUpcomingStreams(): Promise<Stream[]> {
    const now = new Date();
    return Array.from(this.streams.values()).filter(
      (stream) => !stream.isLive && stream.startTime > now
    );
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const id = this.streamIdCounter++;
    const stream: Stream = {
      ...insertStream as any,
      id
    };
    this.streams.set(id, stream);
    return stream;
  }

  async updateStream(id: number, streamData: Partial<InsertStream>): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;
    
    const updatedStream: Stream = { ...stream, ...streamData as any };
    this.streams.set(id, updatedStream);
    return updatedStream;
  }

  async updateViewerCount(id: number, viewerCount: number): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;
    
    const updatedStream: Stream = { ...stream, viewerCount };
    this.streams.set(id, updatedStream);
    return updatedStream;
  }

  async deleteStream(id: number): Promise<boolean> {
    return this.streams.delete(id);
  }

  // Viewer session operations
  async getViewerSession(id: number): Promise<ViewerSession | undefined> {
    return this.viewerSessions.get(id);
  }

  async getActiveViewerSessions(videoId?: number, streamId?: number): Promise<ViewerSession[]> {
    return Array.from(this.viewerSessions.values()).filter(
      (session) => {
        const isActive = session.isActive;
        const matchesVideo = !videoId || session.videoId === videoId;
        const matchesStream = !streamId || session.streamId === streamId;
        return isActive && matchesVideo && matchesStream;
      }
    );
  }

  async createViewerSession(insertSession: InsertViewerSession): Promise<ViewerSession> {
    const id = this.viewerSessionIdCounter++;
    const session: ViewerSession = {
      ...insertSession as any,
      id
    };
    this.viewerSessions.set(id, session);
    return session;
  }

  async updateViewerSession(id: number, sessionData: Partial<InsertViewerSession>): Promise<ViewerSession | undefined> {
    const session = this.viewerSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: ViewerSession = { ...session, ...sessionData as any };
    this.viewerSessions.set(id, updatedSession);
    return updatedSession;
  }

  async endViewerSession(id: number): Promise<ViewerSession | undefined> {
    const session = this.viewerSessions.get(id);
    if (!session) return undefined;
    
    const now = new Date();
    const updatedSession: ViewerSession = { 
      ...session, 
      isActive: false,
      endedAt: now
    };
    this.viewerSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId && !notification.isRead
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification as any,
      id,
      createdAt: now,
      isRead: false
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
    
    // Seed initial admin user if not exists
    this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      const adminExists = await this.getUserByUsername("admin");
      if (!adminExists) {
        await this.createUser({
          username: "admin",
          email: "admin@streamsync.com",
          password: "adminPassword", // In a real app, this would be hashed
          role: UserRole.ADMIN,
          displayName: "Admin User"
        });
        console.log("Admin user created");
      }
    } catch (error) {
      console.error("Error seeding admin user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return await db.select().from(videos)
      .where(eq(videos.category, category))
      .orderBy(desc(videos.createdAt));
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const result = await db.insert(videos).values({
      ...insertVideo,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  async updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video | undefined> {
    const result = await db.update(videos)
      .set(videoData)
      .where(eq(videos.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id));
    return !!result;
  }

  async getStream(id: number): Promise<Stream | undefined> {
    const result = await db.select().from(streams).where(eq(streams.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getLiveStreams(): Promise<Stream[]> {
    return await db.select().from(streams)
      .where(eq(streams.isLive, true))
      .orderBy(desc(streams.startTime));
  }

  async getUpcomingStreams(): Promise<Stream[]> {
    const now = new Date();
    return await db.select().from(streams)
      .where(
        and(
          eq(streams.isLive, false),
          gt(streams.startTime, now)
        )
      )
      .orderBy(streams.startTime);
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const result = await db.insert(streams).values(insertStream).returning();
    return result[0];
  }

  async updateStream(id: number, streamData: Partial<InsertStream>): Promise<Stream | undefined> {
    const result = await db.update(streams)
      .set(streamData)
      .where(eq(streams.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async updateViewerCount(id: number, viewerCount: number): Promise<Stream | undefined> {
    const result = await db.update(streams)
      .set({ viewerCount })
      .where(eq(streams.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteStream(id: number): Promise<boolean> {
    const result = await db.delete(streams).where(eq(streams.id, id));
    return !!result;
  }

  async getViewerSession(id: number): Promise<ViewerSession | undefined> {
    const result = await db.select().from(viewerSessions).where(eq(viewerSessions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getActiveViewerSessions(videoId?: number, streamId?: number): Promise<ViewerSession[]> {
    let query = db.select().from(viewerSessions);
    
    // Build the where conditions based on parameters
    const conditions = [eq(viewerSessions.isActive, true)];
    
    if (videoId !== undefined) {
      conditions.push(eq(viewerSessions.videoId, videoId));
    }
    
    if (streamId !== undefined) {
      conditions.push(eq(viewerSessions.streamId, streamId));
    }
    
    return await query.where(and(...conditions));
  }

  async createViewerSession(insertSession: InsertViewerSession): Promise<ViewerSession> {
    const result = await db.insert(viewerSessions).values({
      ...insertSession,
      startedAt: new Date()
    }).returning();
    
    return result[0];
  }

  async updateViewerSession(id: number, sessionData: Partial<InsertViewerSession>): Promise<ViewerSession | undefined> {
    const result = await db.update(viewerSessions)
      .set(sessionData)
      .where(eq(viewerSessions.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async endViewerSession(id: number): Promise<ViewerSession | undefined> {
    const result = await db.update(viewerSessions)
      .set({
        isActive: false,
        endedAt: new Date()
      })
      .where(eq(viewerSessions.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      ...insertNotification,
      isRead: false,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return !!result;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();