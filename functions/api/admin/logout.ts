// Cloudflare Pages Function for admin logout
export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    }
  });
};
