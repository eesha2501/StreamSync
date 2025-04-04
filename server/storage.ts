import { 
  users, type User, type InsertUser,
  videos, type Video, type InsertVideo,
  streams, type Stream, type InsertStream,
  viewerSessions, type ViewerSession, type InsertViewerSession,
  notifications, type Notification, type InsertNotification,
  UserRole
} from "@shared/schema";

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
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
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
      ...insertVideo,
      id,
      createdAt: now
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = { ...video, ...videoData };
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
      ...insertStream,
      id
    };
    this.streams.set(id, stream);
    return stream;
  }

  async updateStream(id: number, streamData: Partial<InsertStream>): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;
    
    const updatedStream: Stream = { ...stream, ...streamData };
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
      ...insertSession,
      id
    };
    this.viewerSessions.set(id, session);
    return session;
  }

  async updateViewerSession(id: number, sessionData: Partial<InsertViewerSession>): Promise<ViewerSession | undefined> {
    const session = this.viewerSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: ViewerSession = { ...session, ...sessionData };
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
      ...insertNotification,
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

export const storage = new MemStorage();
