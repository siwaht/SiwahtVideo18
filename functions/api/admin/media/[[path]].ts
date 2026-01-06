// Cloudflare Pages Function for media management
// Uses Cloudflare KV for metadata and R2 for files

interface Env {
  MEDIA_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  JWT_SECRET: string;
}

interface Media {
  id: string;
  title: string;
  category: string;
  description?: string;
  fileType: 'video' | 'audio';
  originalFilename: string;
  compressedFilePath: string;
  thumbnailPath?: string;
  duration?: string;
  fileSize: string;
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

function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get("Cookie");
  const token = getCookie(cookieHeader, "admin_token");
  
  if (!token) return false;
  
  try {
    const decoded = JSON.parse(atob(token));
    return decoded.exp && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

// GET /api/admin/media - List all media
// GET /api/admin/media/:id - Get single media
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const path = params.path as string[] | undefined;
  const mediaId = path?.[0];
  
  try {
    if (mediaId) {
      // Get single media
      const media = await env.MEDIA_KV.get(`media:${mediaId}`, "json");
      if (!media) {
        return new Response(JSON.stringify({ error: "Media not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify(media), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // List all media
    const list = await env.MEDIA_KV.list({ prefix: "media:" });
    const mediaItems: Media[] = [];
    
    for (const key of list.keys) {
      const item = await env.MEDIA_KV.get(key.name, "json") as Media;
      if (item) mediaItems.push(item);
    }
    
    // Sort by createdAt descending
    mediaItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return new Response(JSON.stringify(mediaItems), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch media" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// PATCH /api/admin/media/:id - Update media
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const path = params.path as string[] | undefined;
  const mediaId = path?.[0];
  
  if (!mediaId) {
    return new Response(JSON.stringify({ error: "Media ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const updates = await request.json() as Partial<Media>;
    const existing = await env.MEDIA_KV.get(`media:${mediaId}`, "json") as Media;
    
    if (!existing) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const updated: Media = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await env.MEDIA_KV.put(`media:${mediaId}`, JSON.stringify(updated));
    
    return new Response(JSON.stringify(updated), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update media" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// DELETE /api/admin/media/:id - Delete media
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const path = params.path as string[] | undefined;
  const mediaId = path?.[0];
  
  if (!mediaId) {
    return new Response(JSON.stringify({ error: "Media ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    // Get media to find file path
    const media = await env.MEDIA_KV.get(`media:${mediaId}`, "json") as Media | null;
    
    if (media) {
      // Delete file from R2 if it exists
      const filePath = media.compressedFilePath?.replace('/cdn/', '');
      if (filePath) {
        await env.MEDIA_BUCKET.delete(filePath);
      }
      
      // Delete thumbnail if exists
      if (media.thumbnailPath) {
        const thumbPath = media.thumbnailPath.replace('/cdn/', '');
        await env.MEDIA_BUCKET.delete(thumbPath);
      }
    }
    
    // Delete from KV
    await env.MEDIA_KV.delete(`media:${mediaId}`);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete media" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
