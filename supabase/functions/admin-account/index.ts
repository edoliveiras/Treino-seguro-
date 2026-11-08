import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "null",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  const allowedOrigin = Deno.env.get("APP_ORIGIN");
  const origin = request.headers.get("origin");
  if (!allowedOrigin || !origin || origin !== allowedOrigin) {
    return json(403, { error: "origin_not_allowed" });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json(401, { error: "authentication_required" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return json(503, { error: "service_unavailable" });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return json(401, { error: "authentication_required" });
  if (userData.user.app_metadata?.role !== "admin") {
    return json(403, { error: "not_authorized" });
  }

  let body: { action?: unknown; targetUserId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }

  const action = body.action;
  const targetUserId = body.targetUserId;
  if (
    !["suspend", "reactivate", "delete"].includes(String(action)) ||
    typeof targetUserId !== "string" ||
    !uuidPattern.test(targetUserId)
  ) {
    return json(400, { error: "invalid_request" });
  }

  const rpc = action === "delete"
    ? await client.rpc("admin_delete_account", { p_target_user_id: targetUserId })
    : await client.rpc("admin_set_account_status", {
      p_target_user_id: targetUserId,
      p_action: action,
    });

  if (rpc.error) {
    const status = rpc.error.code === "42501" ? 403 : 400;
    return json(status, { error: status === 403 ? "not_authorized" : "request_not_completed" });
  }

  return json(200, { success: true });
});
