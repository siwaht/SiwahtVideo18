import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactSubmissionSchema,
  updateMediaSchema
} from "@shared/schema";
import { z } from "zod";
import { adminLogin, adminLogout, requireAuth, checkAuth } from "./middleware/auth";
import { mediaStorage } from "./media-storage";
import { mediaProcessor } from "./media-processor";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

export async function registerRoutes(app: Express): Promise<Server> {
  // Public endpoints
  
  // Public API endpoints for frontend samples/portfolio
  app.get("/api/samples/demo-videos", async (req, res) => {
    try {
      const adminVideos = await mediaStorage.getMediaByCategory("AI Video Studio");

      const demoVideos = adminVideos
        .filter(media => media.fileType === "video")
        .map((media, index) => ({
          id: media.id,
          title: media.title,
          description: media.description || "Professional AI-generated video content",
          videoUrl: media.compressedFilePath,
          thumbnailUrl: media.thumbnailPath || null,
          category: "demo",
          duration: media.duration || "30s",
          orderIndex: index,
          isPublished: true,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt
        }));

      res.json(demoVideos);
    } catch (error) {
      console.error("Error fetching demo videos:", error);
      res.status(500).json({ error: "Failed to fetch demo videos" });
    }
  });

  app.get("/api/samples/avatars", async (req, res) => {
    try {
      const adminAvatars = await mediaStorage.getMediaByCategory("Avatar Studio");

      const avatars = adminAvatars
        .filter(media => media.fileType === "video")
        .map((media, index) => ({
          id: media.id,
          name: media.title,
          role: "Custom Avatar",
          videoUrl: media.compressedFilePath,
          thumbnailUrl: media.thumbnailPath || null,
          description: media.description || "Professional AI-generated avatar",
          orderIndex: index,
          isPublished: true,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt
        }));

      res.json(avatars);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      res.status(500).json({ error: "Failed to fetch avatars" });
    }
  });

  app.get("/api/samples/voice-samples", async (req, res) => {
    try {
      const voiceMedia = await mediaStorage.getMediaByCategory("Professional Multilingual Voice Ads");

      const voiceSamples = voiceMedia
        .filter(media => media.fileType === "audio")
        .map((media, index) => ({
          id: media.id,
          name: media.title,
          language: media.audioMetadata?.language || "English",
          gender: media.audioMetadata?.gender || "Neutral",
          accent: media.audioMetadata?.accent || undefined,
          ageRange: media.audioMetadata?.ageRange || undefined,
          audioUrl: media.compressedFilePath,
          duration: media.duration || "30s",
          description: media.description || "Custom voice ad",
          orderIndex: index,
          isPublished: true,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt
        }));

      res.json(voiceSamples);
    } catch (error) {
      console.error("Error fetching voice samples:", error);
      res.status(500).json({ error: "Failed to fetch voice samples" });
    }
  });

  app.get("/api/samples/edited-videos", async (req, res) => {
    try {
      const editedMedia = await mediaStorage.getMediaByCategory("AI Video Editing");

      const editedVideos = editedMedia
        .filter(media => media.fileType === "video")
        .map((media, index) => ({
          id: media.id,
          title: media.title,
          projectType: "Custom Edit",
          duration: media.duration || "60s",
          videoUrl: media.compressedFilePath,
          thumbnailUrl: media.thumbnailPath || null,
          description: media.description || "Professionally edited video content",
          orderIndex: index,
          isPublished: true,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt
        }));

      res.json(editedVideos);
    } catch (error) {
      console.error("Error fetching edited videos:", error);
      res.status(500).json({ error: "Failed to fetch edited videos" });
    }
  });

  app.get("/api/samples/podcast-samples", async (req, res) => {
    try {
      const podcastMedia = await mediaStorage.getMediaByCategory("AI Podcast Production");

      const podcastSamples = podcastMedia
        .filter(media => media.fileType === "audio")
        .map((media, index) => ({
          id: media.id,
          title: media.title,
          category: media.audioMetadata?.tags?.[0] || "general",
          episodeNumber: media.audioMetadata?.episodeType || "",
          duration: media.duration || "15m",
          audioUrl: media.compressedFilePath,
          description: media.description || "Professional podcast episode",
          hostName: media.audioMetadata?.hostName || undefined,
          guestName: media.audioMetadata?.guestName || undefined,
          orderIndex: index,
          isPublished: true,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt
        }));

      res.json(podcastSamples);
    } catch (error) {
      console.error("Error fetching podcast samples:", error);
      res.status(500).json({ error: "Failed to fetch podcast samples" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      res.json({ 
        success: true, 
        message: "Thank you for your message! We'll get back to you soon.",
        id: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Admin Routes
  // Configure multer for file uploads
  const upload = multer({
    dest: path.join(process.cwd(), "temp-uploads"),
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB max file size
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only video and audio files are allowed.'));
      }
    }
  });

  // Auth endpoints
  app.post("/api/admin/login", adminLogin);
  app.post("/api/admin/logout", adminLogout);
  app.get("/api/admin/check-auth", checkAuth);

  // Protected admin endpoints
  app.get("/api/admin/media", requireAuth, async (req, res) => {
    try {
      const media = await mediaStorage.getAllMedia();
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.get("/api/admin/media/:id", requireAuth, async (req, res) => {
    try {
      const media = await mediaStorage.getMediaById(req.params.id);
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Upload endpoint with file processing
  app.post("/api/admin/media/upload", requireAuth, upload.single('file'), async (req, res) => {
    const tempPath = req.file?.path;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, category, description, audioMetadata } = req.body;
      
      if (!title || !category) {
        // Clean up temp file
        if (tempPath) await fs.unlink(tempPath).catch(console.error);
        return res.status(400).json({ error: "Title and category are required" });
      }
      
      // Parse audio metadata if provided
      let parsedAudioMetadata = null;
      if (audioMetadata) {
        try {
          parsedAudioMetadata = JSON.parse(audioMetadata);
        } catch (e) {
          console.error("Failed to parse audio metadata:", e);
        }
      }

      // Determine file type
      const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'audio';

      console.log(`Processing ${fileType}: ${req.file.originalname}`);

      // Process the media file (compress and generate thumbnail)
      const processed = await mediaProcessor.processMedia(
        tempPath!,
        req.file.originalname,
        fileType
      );

      // Save to database
      const media = await mediaStorage.createMedia({
        title,
        category,
        description: description || undefined,
        fileType,
        originalFilename: req.file.originalname,
        compressedFilePath: processed.compressedPath,
        thumbnailPath: processed.thumbnailPath,
        duration: processed.duration,
        fileSize: processed.fileSize,
        metadata: processed.metadata,
        audioMetadata: parsedAudioMetadata || undefined,
      });

      // Clean up temp file
      await fs.unlink(tempPath!).catch(console.error);

      res.json(media);
    } catch (error) {
      console.error("Error uploading media:", error);
      // Clean up temp file on error
      if (tempPath) await fs.unlink(tempPath).catch(console.error);
      res.status(500).json({ error: "Failed to upload and process media" });
    }
  });

  // Update media
  app.patch("/api/admin/media/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateMediaSchema.parse(req.body);
      const media = await mediaStorage.updateMedia(req.params.id, validatedData);
      
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      
      res.json(media);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        console.error("Error updating media:", error);
        res.status(500).json({ error: "Failed to update media" });
      }
    }
  });

  // Delete media
  app.delete("/api/admin/media/:id", requireAuth, async (req, res) => {
    try {
      const media = await mediaStorage.getMediaById(req.params.id);
      
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }

      // Delete files from storage
      await mediaProcessor.deleteMediaFiles(media.compressedFilePath, media.thumbnailPath || undefined);

      // Delete from database
      await mediaStorage.deleteMedia(req.params.id);
      
      res.json({ success: true, message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}