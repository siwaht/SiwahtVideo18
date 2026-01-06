import {
  type ContactSubmission,
  type InsertContactSubmission,
  type DemoVideo,
  type InsertDemoVideo,
  type Avatar,
  type InsertAvatar,
  type VoiceSample,
  type InsertVoiceSample,
  type EditedVideo,
  type InsertEditedVideo,
  type PodcastSample,
  type InsertPodcastSample,
} from "@shared/schema";

export interface IStorage {
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission>;
  
  // Demo videos
  getDemoVideos(limit?: number): Promise<DemoVideo[]>;
  getDemoVideo(id: string): Promise<DemoVideo | undefined>;
  createDemoVideo(video: InsertDemoVideo): Promise<DemoVideo>;
  updateDemoVideo(id: string, updates: Partial<DemoVideo>): Promise<DemoVideo>;
  deleteDemoVideo(id: string): Promise<void>;
  searchDemoVideos(query: string): Promise<DemoVideo[]>;
  
  // Avatars
  getAvatars(limit?: number): Promise<Avatar[]>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar>;
  deleteAvatar(id: string): Promise<void>;
  searchAvatars(query: string): Promise<Avatar[]>;
  
  // Voice samples
  getVoiceSamples(limit?: number): Promise<VoiceSample[]>;
  getVoiceSample(id: string): Promise<VoiceSample | undefined>;
  createVoiceSample(sample: InsertVoiceSample): Promise<VoiceSample>;
  updateVoiceSample(id: string, updates: Partial<VoiceSample>): Promise<VoiceSample>;
  deleteVoiceSample(id: string): Promise<void>;
  searchVoiceSamples(query: string): Promise<VoiceSample[]>;
  
  // Edited videos
  getEditedVideos(limit?: number): Promise<EditedVideo[]>;
  getEditedVideo(id: string): Promise<EditedVideo | undefined>;
  createEditedVideo(video: InsertEditedVideo): Promise<EditedVideo>;
  updateEditedVideo(id: string, updates: Partial<EditedVideo>): Promise<EditedVideo>;
  deleteEditedVideo(id: string): Promise<void>;
  searchEditedVideos(query: string): Promise<EditedVideo[]>;
  
  // Podcast samples
  getPodcastSamples(limit?: number): Promise<PodcastSample[]>;
  getPodcastSample(id: string): Promise<PodcastSample | undefined>;
  createPodcastSample(sample: InsertPodcastSample): Promise<PodcastSample>;
  updatePodcastSample(id: string, updates: Partial<PodcastSample>): Promise<PodcastSample>;
  deletePodcastSample(id: string): Promise<void>;
  searchPodcastSamples(query: string): Promise<PodcastSample[]>;
}

// In-memory storage implementation for development
class MemStorage implements IStorage {
  private contacts: ContactSubmission[] = [];

  // Contact submissions - simplified for webhook integration
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const contact: ContactSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      ...submission,
      status: "unread",
      adminNotes: null,
      company: submission.company || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return [...this.contacts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Contact not found");
    
    this.contacts[index] = { ...this.contacts[index], ...updates, updatedAt: new Date() };
    return this.contacts[index];
  }

  async getDemoVideos(limit = 50): Promise<DemoVideo[]> {
    return [];
  }

  async getDemoVideo(id: string): Promise<DemoVideo | undefined> {
    return undefined;
  }

  async createDemoVideo(video: InsertDemoVideo): Promise<DemoVideo> {
    throw new Error("Not implemented - use media storage");
  }

  async updateDemoVideo(id: string, updates: Partial<DemoVideo>): Promise<DemoVideo> {
    throw new Error("Not implemented - use media storage");
  }

  async deleteDemoVideo(id: string): Promise<void> {
    throw new Error("Not implemented - use media storage");
  }

  async searchDemoVideos(query: string): Promise<DemoVideo[]> {
    return [];
  }

  async getAvatars(limit = 50): Promise<Avatar[]> {
    return [];
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    return undefined;
  }

  async createAvatar(avatar: InsertAvatar): Promise<Avatar> {
    throw new Error("Not implemented - use media storage");
  }

  async updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar> {
    throw new Error("Not implemented - use media storage");
  }

  async deleteAvatar(id: string): Promise<void> {
    throw new Error("Not implemented - use media storage");
  }

  async searchAvatars(query: string): Promise<Avatar[]> {
    return [];
  }

  async getVoiceSamples(limit = 50): Promise<VoiceSample[]> {
    return [];
  }

  async getVoiceSample(id: string): Promise<VoiceSample | undefined> {
    return undefined;
  }

  async createVoiceSample(sample: InsertVoiceSample): Promise<VoiceSample> {
    throw new Error("Not implemented - use media storage");
  }

  async updateVoiceSample(id: string, updates: Partial<VoiceSample>): Promise<VoiceSample> {
    throw new Error("Not implemented - use media storage");
  }

  async deleteVoiceSample(id: string): Promise<void> {
    throw new Error("Not implemented - use media storage");
  }

  async searchVoiceSamples(query: string): Promise<VoiceSample[]> {
    return [];
  }

  async getEditedVideos(limit = 50): Promise<EditedVideo[]> {
    return [];
  }

  async getEditedVideo(id: string): Promise<EditedVideo | undefined> {
    return undefined;
  }

  async createEditedVideo(video: InsertEditedVideo): Promise<EditedVideo> {
    throw new Error("Not implemented - use media storage");
  }

  async updateEditedVideo(id: string, updates: Partial<EditedVideo>): Promise<EditedVideo> {
    throw new Error("Not implemented - use media storage");
  }

  async deleteEditedVideo(id: string): Promise<void> {
    throw new Error("Not implemented - use media storage");
  }

  async searchEditedVideos(query: string): Promise<EditedVideo[]> {
    return [];
  }

  async getPodcastSamples(limit = 50): Promise<PodcastSample[]> {
    return [];
  }

  async getPodcastSample(id: string): Promise<PodcastSample | undefined> {
    return undefined;
  }

  async createPodcastSample(sample: InsertPodcastSample): Promise<PodcastSample> {
    throw new Error("Not implemented - use media storage");
  }

  async updatePodcastSample(id: string, updates: Partial<PodcastSample>): Promise<PodcastSample> {
    throw new Error("Not implemented - use media storage");
  }

  async deletePodcastSample(id: string): Promise<void> {
    throw new Error("Not implemented - use media storage");
  }

  async searchPodcastSamples(query: string): Promise<PodcastSample[]> {
    return [];
  }
}

export const storage = new MemStorage();