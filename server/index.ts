import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cookieParser from "cookie-parser";
import { connectToMongoDB } from "./mongodb";
import { SiwahtVideoService } from "./siwahtvideo-service";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static video files before other middleware
const videosPath = path.resolve(import.meta.dirname, "..", "public", "videos");
app.use("/videos", express.static(videosPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      // Add cache control for optimized web videos
      if (filePath.includes('-web.mp4')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }
}));

// Serve static uploaded media files
const uploadsPath = path.resolve(import.meta.dirname, "..", "public", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Serve static audio files
const audioPath = path.resolve(import.meta.dirname, "..", "public", "audio");
app.use("/audio", express.static(audioPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      // Add cache control for optimized web audio
      if (filePath.includes('-web.mp3')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    } else if (filePath.endsWith('.aac')) {
      res.setHeader('Content-Type', 'audio/aac');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MongoDB connection
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await connectToMongoDB(mongoUri);
      await SiwahtVideoService.createIndexes();
      log('MongoDB connected and SiwahtVideo collection ready');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      // Continue running the app even if MongoDB fails
    }
  } else {
    log('MongoDB URI not provided - MongoDB features disabled');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
