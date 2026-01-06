// Cloudflare Pages Function to serve media files from R2

interface Env {
  MEDIA_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  
  const path = params.path as string[];
  const filePath = path.join('/');
  
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }
  
  try {
    const object = await env.MEDIA_BUCKET.get(filePath);
    
    if (!object) {
      return new Response("Not found", { status: 404 });
    }
    
    const headers = new Headers();
    
    // Set content type
    if (object.httpMetadata?.contentType) {
      headers.set("Content-Type", object.httpMetadata.contentType);
    }
    
    // Set cache headers for media files
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    
    // Support range requests for video/audio streaming
    headers.set("Accept-Ranges", "bytes");
    
    // Set content length
    headers.set("Content-Length", object.size.toString());
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

// Handle HEAD requests for video players
export const onRequestHead: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  
  const path = params.path as string[];
  const filePath = path.join('/');
  
  if (!filePath) {
    return new Response(null, { status: 404 });
  }
  
  try {
    const object = await env.MEDIA_BUCKET.head(filePath);
    
    if (!object) {
      return new Response(null, { status: 404 });
    }
    
    const headers = new Headers();
    
    if (object.httpMetadata?.contentType) {
      headers.set("Content-Type", object.httpMetadata.contentType);
    }
    
    headers.set("Content-Length", object.size.toString());
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    
    return new Response(null, { headers });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
};
