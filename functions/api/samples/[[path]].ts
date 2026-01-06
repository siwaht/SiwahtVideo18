// Cloudflare Pages Function for public sample endpoints
// Serves demo videos, avatars, voice samples, etc.

interface Env {
  MEDIA_KV: KVNamespace;
}

interface Media {
  id: string;
  title: string;
  category: string;
  description?: string;
  fileType: 'video' | 'audio';
  compressedFilePath: string;
  thumbnailPath?: string;
  duration?: string;
  audioMetadata?: {
    language?: string;
    gender?: string;
    accent?: string;
    ageRange?: string;
    episodeType?: string;
    tags?: string[];
    hostName?: string;
    guestName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const categoryMap: Record<string, string> = {
  "demo-videos": "AI Video Studio",
  "avatars": "Avatar Studio",
  "voice-samples": "Professional Multilingual Voice Ads",
  "edited-videos": "AI Video Editing",
  "podcast-samples": "AI Podcast Production"
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  
  const path = params.path as string[] | undefined;
  const endpoint = path?.[0];
  
  if (!endpoint || !categoryMap[endpoint]) {
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const category = categoryMap[endpoint];
  
  try {
    const list = await env.MEDIA_KV.list({ prefix: "media:" });
    const mediaItems: Media[] = [];
    
    for (const key of list.keys) {
      const item = await env.MEDIA_KV.get(key.name, "json") as Media;
      if (item && item.category === category) {
        mediaItems.push(item);
      }
    }
    
    // Transform based on endpoint type
    let result;
    
    switch (endpoint) {
      case "demo-videos":
        result = mediaItems
          .filter(m => m.fileType === "video")
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
        break;
        
      case "avatars":
        result = mediaItems
          .filter(m => m.fileType === "video")
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
        break;
        
      case "voice-samples":
        result = mediaItems
          .filter(m => m.fileType === "audio")
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
        break;
        
      case "edited-videos":
        result = mediaItems
          .filter(m => m.fileType === "video")
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
        break;
        
      case "podcast-samples":
        result = mediaItems
          .filter(m => m.fileType === "audio")
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
        break;
        
      default:
        result = [];
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch samples" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
