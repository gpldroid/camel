// Cloudflare Worker OAuth proxy starter for Decap CMS GitHub backend.
// Set Worker secrets: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
// Set Worker variables: OAUTH_REDIRECT_URI (https://worker.example.com/callback),
// CMS_ORIGIN (https://gpldroid.github.io). Use the exact published origin.
// Register OAUTH_REDIRECT_URI as the callback URL in your GitHub OAuth App.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const target = new URL("https://github.com/login/oauth/authorize");
      target.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      target.searchParams.set("redirect_uri", env.OAUTH_REDIRECT_URI);
      target.searchParams.set("scope", "repo");
      target.searchParams.set("state", state);
      return new Response(null, {
        status: 302,
        headers: {
          Location: target.toString(),
          "Set-Cookie": `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
        },
      });
    }
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const cookie = request.headers.get("Cookie") || "";
      const savedState = cookie.match(/(?:^|; )decap_oauth_state=([^;]+)/)?.[1];
      if (!code || !state || !savedState || state !== savedState) return json({ error: "Invalid OAuth state or missing code" }, 400);
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: env.OAUTH_REDIRECT_URI }),
      });
      const token = await tokenResponse.json();
      if (!tokenResponse.ok || token.error || !token.access_token) return json({ error: "GitHub OAuth exchange failed" }, 401);
      const message = "authorization:github:success:" + JSON.stringify({ token: token.access_token, provider: "github" });
      const safeMessage = JSON.stringify(message).replace(/</g, "\\u003c");
      const safeOrigin = JSON.stringify(env.CMS_ORIGIN || "").replace(/</g, "\\u003c");
      const html = `<!doctype html><meta charset="utf-8"><title>Authentication</title><script>
        const targetOrigin=${safeOrigin};
        if (!targetOrigin || !window.opener) { document.body.textContent="Authentication callback is missing its configured CMS origin. Close this window."; }
        else { window.opener.postMessage(${safeMessage}, targetOrigin); window.close(); }
      </script>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Set-Cookie": "decap_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" } });
    }
    return new Response("Not found", { status: 404 });
  },
};
