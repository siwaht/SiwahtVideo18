import type { InsertMedia, UpdateMedia, Media } from "@shared/schema";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "server", "media-db.json");

// File-based storage for media items that persists across restarts
export class MediaStorage {
  private mediaItems: Map<string, Media> = new Map();

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(data);
        if (parsed.media && Array.isArray(parsed.media)) {
          parsed.media.forEach((item: any) => {
            // Convert date strings back to Date objects
            item.createdAt = new Date(item.createdAt);
            item.updatedAt = new Date(item.updatedAt);
            this.mediaItems.set(item.id, item);
          });
        }
      }
    } catch (error) {
      console.error("Error loading media database:", error);
      // Initialize with empty data if load fails
      this.saveToFile();
    }
  }

  private saveToFile() {
    try {
      const data = {
        media: Array.from(this.mediaItems.values())
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving media database:", error);
    }
  }

  // Get all media items
  async getAllMedia(): Promise<Media[]> {
    const items = Array.from(this.mediaItems.values());
    // Sort by createdAt descending
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get single media item
  async getMediaById(id: string): Promise<Media | undefined> {
    return this.mediaItems.get(id);
  }

  // Create new media item
  async createMedia(data: InsertMedia): Promise<Media> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newMedia: Media = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.mediaItems.set(id, newMedia);
    this.saveToFile();
    return newMedia;
  }

  // Update media item
  async updateMedia(id: string, data: UpdateMedia): Promise<Media | undefined> {
    const existing = this.mediaItems.get(id);
    if (!existing) return undefined;
    
    const updated: Media = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.mediaItems.set(id, updated);
    this.saveToFile();
    return updated;
  }

  // Delete media item
  async deleteMedia(id: string): Promise<boolean> {
    const result = this.mediaItems.delete(id);
    if (result) {
      this.saveToFile();
    }
    return result;
  }

  // Get media items by category
  async getMediaByCategory(category: string): Promise<Media[]> {
    const items = Array.from(this.mediaItems.values());
    return items.filter(item => item.category === category);
  }
}

export const mediaStorage = new MediaStorage();