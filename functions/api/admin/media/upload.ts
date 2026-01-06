// Cloudflare Pages Function for media upload with R2 storage

interface Env {
  MEDIA_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
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

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;
    const audioMetadataStr = formData.get("audioMetadata") as string | null;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (!title || !category) {
      return new Response(JSON.stringify({ error: "Title and category are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Validate file type
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    
    if (!isVideo && !isAudio) {
      return new Response(JSON.stringify({ error: "Invalid file type. Only video and audio files are allowed." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const fileType = isVideo ? "video" : "audio";
    const mediaId = generateId();
    const fileExtension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'mp3');
    const storagePath = `media/${fileType}s/${mediaId}.${fileExtension}`;
    
    // Upload file to R2
    const fileBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(storagePath, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalFilename: file.name,
        title: title,
        category: category,
      }
    });
    
    // Parse audio metadata if provided
    let audioMetadata = null;
    if (audioMetadataStr) {
      try {
        audioMetadata = JSON.parse(audioMetadataStr);
      } catch (e) {
        console.error("Failed to parse audio metadata:", e);
      }
    }
    
    // Create media record
    const media: Media = {
      id: mediaId,
      title,
      category,
      description: description || undefined,
      fileType,
      originalFilename: file.name,
      compressedFilePath: `/cdn/${storagePath}`,
      thumbnailPath: undefined,
      duration: undefined,
      fileSize: file.size.toString(),
      audioMetadata: audioMetadata || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to KV
    await env.MEDIA_KV.put(`media:${mediaId}`, JSON.stringify(media));
    
    return new Response(JSON.stringify(media), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Failed to upload media" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
