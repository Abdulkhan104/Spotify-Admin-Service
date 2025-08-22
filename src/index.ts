import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db";
import adminRoutes from "./route.js";
import cloudinary from "cloudinary";
import { createClient } from "redis";
import cors from "cors";

dotenv.config();

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-12525.c62.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 12525,
  },
});

redisClient
  .connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch(console.error);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS albums(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS songs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        audio VARCHAR(255) NOT NULL,
        album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    console.log("~~ Database initialized successfully ~~");
  } catch (error) {
    console.log("Error initDB", error);
  }
}

app.use("/api/v1", adminRoutes);

const port = process.env.PORT || 7000;

initDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
});
