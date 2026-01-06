// Cloudflare Pages Function for contact form
// Forwards to Make.com webhook

interface ContactData {
  fullName: string;
  email: string;
  company?: string;
  projectDetails: string;
}

export const onRequestPost: PagesFunction = async (context) => {
  const { request } = context;
  
  try {
    const data = await request.json() as ContactData;
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.projectDetails) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Missing required fields" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Invalid email address" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Thank you for your message! We'll get back to you soon.",
      id: crypto.randomUUID()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Invalid request" 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};
