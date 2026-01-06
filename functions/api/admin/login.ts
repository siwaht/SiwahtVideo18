// Cloudflare Pages Function for admin login
interface Env {
  ADMIN_USER: string;
  ADMIN_PASS: string;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json() as { username: string; password: string };
    
    const ADMIN_USER = env.ADMIN_USER || "admin@siwaht.com";
    const ADMIN_PASS = env.ADMIN_PASS || "changeme123";
    const JWT_SECRET = env.JWT_SECRET || "your-secret-key-change-in-production";
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Create a simple token (in production, use proper JWT library)
      const token = btoa(JSON.stringify({ 
        username, 
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }));
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
        }
      });
    }
    
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};
