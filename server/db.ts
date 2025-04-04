import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Client } = pg;

// Create a PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to the database
async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    throw error;
  }
}

// Initialize the connection
connectToDB();

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema });