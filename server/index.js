import express from "express";
import { connectDB } from "./src/common/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import googleAuthRouter from "./src/module/google/routes.js";

async function startServerAndDatabase() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    
    app.use(cors({
        origin: "*",
    }));

    app.use("/", googleAuthRouter);
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the Database:", error);
    process.exit(1);
  }
}

startServerAndDatabase();
