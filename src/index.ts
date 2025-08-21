import  express  from "express";
import dotenv from "dotenv";
import { sql } from "./config/db";
import adminRoutes from "./route.js";
import cloudinary from "cloudinary";
import { createClient } from "redis";
import cors from 'cors';


dotenv.config();

export const redisClient = createClient({
  password: process.env.Redis_Password,
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
    cloud_name:process.env.Cloud_Name,
    api_key:process.env.Cloud_Api_key,
    api_secret:process.env.Cloud_Api_Secret,
})

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
        )
        `;


         await sql`
        CREATE TABLE IF NOT EXISTS songs(
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255) NOT NULL,
          thumbnail VARCHAR(255),
          audio VARCHAR(255) NOT NULL,
          album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `;

        console.log("~~Database initilaize Successfully~~");
    } catch (error) {
        console.log("Error initDB",error)
    }
}

app.use("/api/v1",adminRoutes)

const port = process.env.PORT;

initDB().then(()=>{

    
app.listen(7000,()=>{
    console.log(`server is running on port ${port}`);
});

});
