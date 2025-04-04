import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  USER = "USER",
  CHANNEL_ADMIN = "CHANNEL_ADMIN",
  ADMIN = "ADMIN"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Can be null for Google Auth users
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").unique(),
  role: text("role").notNull().default(UserRole.USER),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
    displayName: true,
    photoURL: true,
    firebaseUid: true,
    role: true,
  })
  .partial({
    password: true,
    displayName: true,
    photoURL: true,
  });

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration"), // Duration in seconds
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  startTime: timestamp("start_time"), // When video becomes available
  endTime: timestamp("end_time"), // When video becomes unavailable
  scheduledAt: timestamp("scheduled_at"), // Backwards compatibility
  userId: integer("user_id").references(() => users.id), // Creator reference
});

export const insertVideoSchema = createInsertSchema(videos)
  .pick({
    title: true,
    description: true,
    category: true,
    thumbnailUrl: true,
    videoUrl: true,
    duration: true,
    isLive: true,
    startTime: true,
    endTime: true,
    scheduledAt: true,
    userId: true,
  })
  .partial({
    description: true,
    category: true,
    thumbnailUrl: true,
    duration: true,
    startTime: true,
    endTime: true,
    scheduledAt: true,
  })
  // Override startTime and endTime fields to use coerce.date() for proper handling
  .extend({
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    scheduledAt: z.coerce.date().optional(),
  });

// Streams table for live and scheduled streams
export const streams = pgTable("streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  streamUrl: text("stream_url").notNull(),
  isLive: boolean("is_live").default(false),
  viewerCount: integer("viewer_count").default(0),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  userId: integer("user_id").references(() => users.id), // Creator reference
});

export const insertStreamSchema = createInsertSchema(streams)
  .pick({
    title: true,
    description: true,
    thumbnailUrl: true,
    streamUrl: true,
    isLive: true,
    viewerCount: true,
    startTime: true,
    endTime: true,
    userId: true,
  })
  .partial({
    description: true,
    thumbnailUrl: true,
    endTime: true,
    viewerCount: true,
  })
  // Override date fields to use coerce.date() for proper handling
  .extend({
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
  });

// ViewerSessions to track active viewers and their timestamp
export const viewerSessions = pgTable("viewer_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  videoId: integer("video_id").references(() => videos.id),
  streamId: integer("stream_id").references(() => streams.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  currentTimestamp: integer("current_timestamp").default(0), // Current playback position in seconds
  isActive: boolean("is_active").default(true),
  endedAt: timestamp("ended_at"),
  deviceInfo: json("device_info"),
});

export const insertViewerSessionSchema = createInsertSchema(viewerSessions)
  .pick({
    userId: true,
    videoId: true,
    streamId: true,
    startedAt: true,
    currentTimestamp: true,
    isActive: true,
    endedAt: true,
    deviceInfo: true,
  })
  .partial({
    videoId: true,
    streamId: true,
    endedAt: true,
    deviceInfo: true,
  });

// Notifications for upcoming streams and events
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  relatedVideoId: integer("related_video_id").references(() => videos.id),
  relatedStreamId: integer("related_stream_id").references(() => streams.id),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .pick({
    userId: true,
    title: true,
    message: true,
    isRead: true,
    relatedVideoId: true,
    relatedStreamId: true,
  })
  .partial({
    isRead: true,
    relatedVideoId: true,
    relatedStreamId: true,
  });

// Type exports for all schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Stream = typeof streams.$inferSelect;

export type InsertViewerSession = z.infer<typeof insertViewerSessionSchema>;
export type ViewerSession = typeof viewerSessions.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
