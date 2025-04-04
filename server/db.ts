import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Create a PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  keepAlive: true, // Use TCP keepalive with server
});

// Log pool events for debugging
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Connect to the database and verify connection
async function connectToDB() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");
    client.release(); // Return client to pool
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    // Don't throw error, just log it - this allows the app to start even if DB is temporarily unavailable
  }
}

// Initialize the connection
connectToDB();

// Create a Drizzle ORM instance with the pool
export const db = drizzle(pool, { schema });