// Cloudflare Pages Function for checking auth status
interface Env {
  JWT_SECRET: string;
}

function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  
  const cookieHeader = request.headers.get("Cookie");
  const token = getCookie(cookieHeader, "admin_token");
  
  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const decoded = JSON.parse(atob(token));
    
    if (decoded.exp && decoded.exp > Date.now()) {
      return new Response(JSON.stringify({ authenticated: true, username: decoded.username }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    // Invalid token
  }
  
  return new Response(JSON.stringify({ authenticated: false }), {
    headers: { "Content-Type": "application/json" }
  });
};
