import express from "express";
import { connectDB } from "./src/common/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import googleAuthRouter from "./src/module/google/routes.js";
import githubRouter from "./src/module/github/routes.js";
import authRoutes from "./src/module/auth/routes.js";
import { authMiddleware } from "./src/common/middleware/auth.middleware.js";

async function startServerAndDatabase() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    
    app.use(cors({
        origin: process.env.FRONTEND_ORIGIN,
        credentials: true,
    }));

    app.get("/me", authMiddleware, (req, res) => {
        res.json({
            message: "You are authenticated",
            user: req.user,
        });
    });
    app.use("/", googleAuthRouter);
    app.use("/", githubRouter);
    app.use("/", authRoutes);
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
