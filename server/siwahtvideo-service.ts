import { ObjectId, OptionalId } from 'mongodb';
import { getCollection } from './mongodb';

export interface SiwahtVideo {
  _id?: ObjectId;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  duration?: number;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    codec?: string;
    format?: string;
    fileSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'SiwahtVideo';

export class SiwahtVideoService {
  /**
   * Create a new video document
   */
  static async createVideo(videoData: Omit<SiwahtVideo, '_id' | 'createdAt' | 'updatedAt'>): Promise<SiwahtVideo> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    const video: OptionalId<SiwahtVideo> = {
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(video);
    return {
      _id: result.insertedId,
      ...video,
    } as SiwahtVideo;
  }

  /**
   * Get all videos with optional filtering
   */
  static async getAllVideos(filter?: {
    category?: string;
    tags?: string[];
    limit?: number;
    skip?: number;
  }): Promise<SiwahtVideo[]> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    const query: any = {};
    if (filter?.category) {
      query.category = filter.category;
    }
    if (filter?.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    let cursor = collection.find(query).sort({ createdAt: -1 });

    if (filter?.skip) {
      cursor = cursor.skip(filter.skip);
    }
    if (filter?.limit) {
      cursor = cursor.limit(filter.limit);
    }

    return await cursor.toArray();
  }

  /**
   * Get a video by ID
   */
  static async getVideoById(id: string): Promise<SiwahtVideo | null> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Update a video
   */
  static async updateVideo(
    id: string,
    updates: Partial<Omit<SiwahtVideo, '_id' | 'createdAt'>>
  ): Promise<SiwahtVideo | null> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  /**
   * Delete a video
   */
  static async deleteVideo(id: string): Promise<boolean> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Get videos by category
   */
  static async getVideosByCategory(category: string): Promise<SiwahtVideo[]> {
    return this.getAllVideos({ category });
  }

  /**
   * Get videos by tags
   */
  static async getVideosByTags(tags: string[]): Promise<SiwahtVideo[]> {
    return this.getAllVideos({ tags });
  }

  /**
   * Search videos by title or description
   */
  static async searchVideos(searchTerm: string): Promise<SiwahtVideo[]> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    return await collection.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Get total count of videos
   */
  static async getVideoCount(filter?: { category?: string; tags?: string[] }): Promise<number> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    const query: any = {};
    if (filter?.category) {
      query.category = filter.category;
    }
    if (filter?.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    return await collection.countDocuments(query);
  }

  /**
   * Create indexes for better query performance
   */
  static async createIndexes(): Promise<void> {
    const collection = getCollection<SiwahtVideo>(COLLECTION_NAME);

    await collection.createIndex({ category: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ title: 'text', description: 'text' });

    console.log('✅ SiwahtVideo collection indexes created');
  }
}
