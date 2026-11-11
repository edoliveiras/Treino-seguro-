import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { deleteUserFoodPhotos } from "../shared/photoCleanup.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  const origin = request.headers.get("origin");
  if (origin !== (Deno.env.get("APP_ORIGIN") ?? "https://treino-seguro.vercel.app")) return json(403, { error: "origin_not_allowed" });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return json(401, { error: "authentication_required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json(503, { error: "service_unavailable" });

  const token = authorization.slice(7);
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json(401, { error: "authentication_required" });

  let body: { action?: unknown };
  try { body = await request.json(); } catch { return json(400, { error: "invalid_request" }); }
  if (body.action !== "grant" && body.action !== "revoke") return json(400, { error: "invalid_request" });

  const action = body.action === "grant" ? "granted" : "withdrawn";
  const { error: consentError } = await userClient.from("account_consent_events").insert({
    user_id: authData.user.id,
    consent_type: "food_photos",
    action,
    policy_version: "2026-11-11",
  });
  if (consentError) return json(400, { error: "consent_not_recorded" });
  if (action === "granted") return json(200, { success: true, consent: "granted" });

  try {
    const deleted = await deleteUserFoodPhotos(adminClient.storage, authData.user.id);
    return json(200, { success: true, consent: "withdrawn", deleted });
  } catch {
    return json(503, { error: "consent_revoked_photo_cleanup_pending", revoked: true });
  }
});
